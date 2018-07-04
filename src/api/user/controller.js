
const uuidv1 = require('uuid/v1');
const fs = require('fs');
const path = require('path');
const Model = require('../../models');
const https = require('https');
console.log("Model", Model.Contacts);
const sequelize = Model.sequelize;

import Hubspot from '../../services/Hubspot'

export const create = (req, res, next) => {
  // fs.readFile(path.join(path.resolve('.'), 'src', 'data.json'), 'utf8', function (err, data) {
  //   if (!err) {
  //     var parsedData = JSON.parse(data)
  //     var newUser = {
  //       id: uuidv1(),
  //       name: req.body.name,
  //       email: req.body.email,
  //       phone: req.body.phone
  //     }
  //     parsedData.users.push(newUser);
  //     var newcontent = JSON.stringify(parsedData);
  //     fs.writeFile(path.join(path.resolve('.', 'src', 'data.json')), newcontent, (error) => {
  //       if (error) res.status(400).end();
  //       else res.status(200).end();
  //     });
  //   }
  //   else res.status(400).end();
  // })
  sequelize.transaction(function (t) {
    return createDBContact(req.body, t)
      .then((contact) => {
        return Hubspot.httpRequest('POST', 'https://api.hubapi.com/contacts/v1/contact/?hapikey=demo', constructContactBody(contact))
          .then((response) => {
            return storeContactResponse(response, contact.User_ID, t)
              .then(() => { return; })
          })
          .catch((hubspotError) => { throw hubspotError; })
      })
  })
    .then(() => { res.status(200).end(); })
    .catch(() => { res.status(400).end(); })

  // createDBContact(req.body)
  //   .then(contact => {
  //     Hubspot.httpRequest('https://api.hubapi.com/contacts/v1/contact/?hapikey=demo', constructContactBody(contact))
  //       .then((response) => {
  //         //response - this is the response from hubspot
  //         console.log("Logging response from hubspot", response);
  //         console.log("vid from response", response.vid);
  //         storeContactResponse(response, contact.User_ID)
  //           .then(() => {
  //             console.log("Strored response");
  //             res.status(200).end();
  //           })
  //       })
  //       .catch((err) => {
  //         console.log("Contact not created", err)
  //       })
  //   })
  //   .then((contact) => {

  //   })
  //   .catch((err) => {
  //     console.log("err", err)
  //   })
}


function createDBContact(reqBody, t) {
  return Model.Contacts.create({
    User_ID: uuidv1(),
    User_First_Name: reqBody.User_First_Name,
    User_Last_Name: reqBody.User_Last_Name,
    User_Email: reqBody.User_Email,
    User_Website: reqBody.User_Website,
    User_Company: reqBody.User_Company,
    User_Phone: reqBody.User_Phone,
    User_Address: reqBody.User_Address,
    User_City: reqBody.User_City,
    User_State: reqBody.User_State,
    User_Zip: reqBody.User_Zip
  }, { transaction: t })
    .then((contact) => {
      return contact.get({ plain: true });
    })
}

function storeContactResponse(response, userId, t) {
  return Model.Contact_Hubspot_Response.create({
    User_ID: userId,
    Hubspot_VID: response.vid,
    Response_JSON: response
  }, { transaction: t })
    .then(() => {
      return;
    })
}


export const index = (req, res, next) => {
  //   fs.readFile(path.join(path.resolve('.'), 'src', 'data.json'), 'utf8', function (err, data) {
  //     if (!err) {
  //       var parsedData = JSON.parse(data)
  //       console.log("Reading completed : data from file", JSON.parse(data));
  //       res.status(200).json(parsedData.users);
  //     }
  //     else res.status(400);
  //   })
  //   console.log("Didn't wait for read to complete");
  Model.Contact_Hubspot_Response.findAll({
    attributes: ['Response_ID', 'User_ID', 'Hubspot_VID', 'Response_JSON']
  })
    .then((Contact_resp) => {
      Hubspot.httpRequest('GET', 'https://api.hubapi.com/contacts/v1/lists/all/contacts/all?hapikey=demo&count=2', null)
        .then((Hubspot_resp) => {
          console.log('Response Contact', Hubspot_resp);
          res.status(200).json(JSON.parse(Hubspot_resp)).end();
        }).catch((err) => {
          res.status(400).end();
        }
        )

    })
    .catch((err) => {
      res.status(400).end();
    })
}


export const show = (req, res, next) => {
  // fs.readFile(path.join(path.resolve('.'), 'src', 'data.json'), 'utf8', function (err, data) {
  //   if (!err) {
  //     var parsedData = JSON.parse(data)
  //     //console.log("Reading completed : data from file", JSON.parse(data));
  //     var userid = req.params.id;
  //     console.log("Id from request", userid);
  //     console.log("Parsed user data", parsedData.users);
  //     var result = parsedData.users.filter(user => user.id == userid);
  //     // var matchedIndex = parsedData.users.findIndex(user => user.id == userid);
  //     // console.log('filtered user', parsedData.users[matchedIndex]);
  //     res.status(200).json(result[0]);
  //   }
  //   else res.status(400);
  // })

  Model.Contact_Hubspot_Response.find({
    where: { User_ID: req.params.id }
  })
    .then((contact_resp) => {
      if (contact_resp) {
        Hubspot.httpRequest('GET', 'https://api.hubapi.com/contacts/v1/contact/vid/' + contact_resp.Hubspot_VID + '/profile?hapikey=demo', null)
          .then((hubspotResp) => {
            console.log("hubspotResp", hubspotResp);
            res.status(200).json(JSON.parse(hubspotResp)).end();
          })
          .catch((err) => { res.status(400).end(); })
      }
      else res.status(200).json({ status: "Contact doesn't exist" }).end();
    })
    .catch((err) => {
      res.status(400).end();
    })
}

export const update = (req, res, next) => {
  //read the json file
  //get the user with the id
  //update the data of the user with coming data(email)
  //save it back to the file
  //return the response

  // fs.readFile(path.join(path.resolve('.'), 'src', 'data.json'), 'utf8', function (err, data) {
  //   if (!err) {
  //     var parsedData = JSON.parse(data);
  //     //console.log("Reading completed : data from file", JSON.parse(data));
  //     var userid = req.params.id;
  //     var newemail = req.body.email;
  //     console.log("Id from request", userid);
  //     console.log('new email', newemail);
  //     // console.log("Parsed user data", parsedData.users);
  //     var result = parsedData.users.filter(user => user.id == userid);
  //     result[0].email = newemail;
  //     //var newdata=JSON.stringify(newemail);
  //     fs.writeFile(path.join(path.resolve('.', 'src', 'data.json')), JSON.stringify(parsedData), (error) => {
  //       if (error) res.status(400).end();
  //       else res.status(200).end();
  //     });
  //   }
  //   else res.status(400).end();
  // })
  Model.Contacts.update(
    { User_Email: req.body.User_Email },
    { where: { User_ID: req.params.id } })
    .then(() => {
      //    email=email.get({plain:true});
      //    console.log('updated email',email);
    })
    .catch((err) => {
      console.log('error', err);
    })
}



export const destroy = (req, res, next) => {
  // fs.readFile(path.join(path.resolve('.'), 'src', 'data.json'), 'utf8', function (err, data) {
  //   if (!err) {
  //     var parsedData = JSON.parse(data);
  //     //console.log("Reading completed : data from file", JSON.parse(data));
  //     var userid = req.params.id;

  //     console.log("Id from request", userid);

  //     // console.log("Parsed user data", parsedData.users);
  //     // var deluser = parsedData.users.filter(user => user.id == userid);
  //     var matchedIndex = parsedData.users.findIndex(user => user.id == userid);
  //     console.log("delete user", parsedData.users[matchedIndex]);
  //     // parsedData.users.pop(deluser);
  //     parsedData.users.splice(matchedIndex, 1);

  //     fs.writeFile(path.join(path.resolve('.', 'src', 'data.json')), JSON.stringify(parsedData), (error) => {
  //       if (error) res.status(400).end();
  //       else {
  //         console.log(parsedData.users);
  //         res.status(200).end();
  //       }
  //     });
  //   }
  //   else res.status(400).end();
  // })

  Model.Contacts.destroy(
    {
      where: { User_ID: req.params.id }
    }
  )
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => {
      console.log(err);
    }
    )

    ;
}

function constructContactBody(contact) {
  //receives contact obj
  //returns a hubspot post body object
  return {
    "properties": [
      {
        "property": "email",
        "value": contact.User_Email
      },
      {
        "property": "firstname",
        "value": contact.User_First_Name
      },
      {
        "property": "lastname",
        "value": contact.User_Last_Name
      },
      {
        "property": "website",
        "value": contact.User_Website
      },
      {
        "property": "company",
        "value": contact.User_Company
      },
      {
        "property": "phone",
        "value": contact.User_Phone
      },
      {
        "property": "address",
        "value": contact.User_Address
      },
      {
        "property": "city",
        "value": contact.User_City
      },
      {
        "property": "state",
        "value": contact.User_State
      },
      {
        "property": "zip",
        "value": contact.User_Zip
      }
    ]
  }

}

//export const options = (req, res, next) => {
//   Model.Contact_Hubspot_Response.findAll()
//   .then((allcontacts)=>
// {
//   console.log('All contacts',allcontacts);
//   res.status(200).json(JSON.parse(allcontacts)).end();
// })
// .catch((err)=>{
//   res.status(400).end();
// })

//}


export const fetchGrpContacts = function (req, res, next) {
  Model.Contact_Hubspot_Response.findAll({
    where: { User_ID: req.body.users },
    raw: true
  })
    .then((Contact_Resp) => {
      console.log("Contact_resp", Contact_Resp);
      var batchVIDStr = ''
      Contact_Resp.forEach((contctResp, index) => {
        if (contctResp.Hubspot_VID) {
          if (index > 0) batchVIDStr = batchVIDStr + '&vid=' + contctResp.Hubspot_VID;
          else batchVIDStr = batchVIDStr + 'vid=' + contctResp.Hubspot_VID;
        }
      })
      console.log("batchVIDStr", batchVIDStr);
      Hubspot.httpRequest('GET', 'https://api.hubapi.com/contacts/v1/contact/vids/batch/?' + batchVIDStr + '&hapikey=demo', null)
        .then((Hubspot_Resp) => {
          console.log("Hubspot Response".Hubspot_Resp);
          res.status(200).json(JSON.parse(Hubspot_Resp)).end();
        }).catch((err) => {
          res.status(400).end();
        })
    }).catch((err) => {
      res.status(400).end();
    })
}


export const fetchContactByEmail = function (req, res, next) {
  Model.Contacts.find({
    where: { User_ID: req.params.id }
  })
    .then((Contact_Resp) => {
      Hubspot.httpRequest('GET', 'https://api.hubapi.com/contacts/v1/contact/email/'+ Contact_Resp.User_Email +'/profile?hapikey=demo', null)
        .then((Hubspot_Resp) => {
          //console.log("Hubspot Response".Hubspot_Resp);
          res.status(200).json(JSON.parse(Hubspot_Resp)).end();
        }).catch((err) => {
          res.status(400).end();
        })
    }).catch((err) => {
      res.status(400).end();
    })
}

export const contactupdate= function (req, res, next){

}

export const contactdelete= function (req, res, next){


}



