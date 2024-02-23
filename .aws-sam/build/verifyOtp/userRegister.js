const Helper = require("db-service/utils/helper");
const helper = new Helper();
const { HTTP_CODE, STATUS } = require("db-service/utils/constants");
const { connectDatabase } = require("db-service/config/db");
const { visitorModel } = require("db-service/models/visitorModel");
const { userModel } = require("db-service/models/userModel");
const { otpModel } = require("db-service/models/otpModel");


function validatePhoneNumber(contact_number) {
  var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (regex.test(contact_number)) {
    return true;
  } else {
    return false;
  }
}

module.export = exports.handler = async (event) => {
  try {
    await connectDatabase();
    const body = JSON.parse(event.body);
    const { phoneNumber, email, name } = body;
    // check the required fields
    if (!phoneNumber || !name || !email) {
      return helper.getResponseObject(false, HTTP_CODE.BAD_REQUEST, [], "Missing Parameters");
    }
    if (!validatePhoneNumber(phoneNumber)) {
      return helper.getResponseObject(false, HTTP_CODE.BAD_REQUEST, [], "Invalid Mobile Number");
    }
    // // check the users is already register or not
    // let visitorData = await visitorModel.findOne({ phoneNumber: phoneNumber });
    // if (!!visitorData && visitorData.phoneNumberStatus === STATUS.VERIFIED) {
    //   return helper.getResponseObject(false, HTTP_CODE.UNAUTHORISED, [], "This mobile number is already registered with simplif5 App");
    // }
    // // generate the OTP for new Registration
    // const generatedOtp = helper.generateOTP();
    // // save the OTP to database with respect to mobile number
    // const otpData = await otpModel.findOneAndUpdate(
    //   { phoneNumber },
    //   { phoneNumber: phoneNumber, otp: generatedOtp },
    //   { upsert: true, new: true }
    // )
    // // update user to Visitor collection or create new
    // visitorData = await visitorModel.findOneAndUpdate(
    //   { phoneNumber },
    //   { name, email, phoneNumber },
    //   { upsert: true, new: true }
    // );

    // return helper.getResponseObject(true, HTTP_CODE.SUCCESS, visitorData, "OTP sent succesfully");

    let visitorData = await visitorModel.findOneAndUpdate({ phoneNumber }, { phoneNumber, email, name }, { upsert: true, new: true });
    return helper.getResponseObject(true, HTTP_CODE.SUCCESS, visitorData, "User Register Succesfully");
  } catch (err) {
    console.error('handler: users | userRegister | error | ', err);
    return helper.getResponseObject(false, HTTP_CODE.BAD_REQUEST, [], "Error: " + err.message);
  }
}