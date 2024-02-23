const Helper = require("db-service/utils/helper");
const helper = new Helper();
const { HTTP_CODE, STATUS, ROLE } = require("db-service/utils/constants");
const { connectDatabase } = require("db-service/config/db");
const { visitorModel } = require("db-service/models/visitorModel");
const { userModel } = require("db-service/models/userModel");
const { otpModel } = require("db-service/models/otpModel");


module.export = exports.handler = async (event) => {
    try {
        await connectDatabase();
        const body = JSON.parse(event.body);
        const { otp, userId } = body;
        // check the required fields
        if (!otp || !userId) {
            return helper.getResponseObject(false, HTTP_CODE.BAD_REQUEST, [], "Missing Parameters");
        }
        const visitorData = await visitorModel.findById(userId);
        console.log("visitorData", visitorData)
        if (!visitorData) {
            return helper.getResponseObject(false, HTTP_CODE.BAD_REQUEST, [], "user not found !");
        }
        const otpData = await otpModel.findOne({ phoneNumber: visitorData.phoneNumber });
        console.log("otpData", otpData)
        if (otpData.otp !== otp) {
            return helper.getResponseObject(false, HTTP_CODE.BAD_REQUEST, [], "invalid OTP !!");
        }
        
        // prepare the payload for creating the verified user
        const userPayload = {
            phoneNumber: visitorData.phoneNumber,
            email: visitorData.email,
            name: visitorData.name,
            role: ROLE.USER
        }
        // register verified Visitor as verified User
        const userDate = await userModel.create(userPayload)

        // update the visitore data
        visitorData.phoneNumberStatus = STATUS.VERIFIED;
        visitorData.role = ROLE.USER;
        visitorData.user = userDate._id;
        await visitorData.save();

        // prepare the success response with headers
        let successResponse = helper.getResponseObject(true, HTTP_CODE.SUCCESS, userDate, "OTP is verified & You have successfully registered on simpli5.");
        successResponse.headers["access-token"] = helper.generateJwtAccessToken({ phoneNumber: userDate.phoneNumber, userId: userDate._id });
        successResponse.headers["refresh-token"] = helper.generateJwtRefreshToken({ phoneNumber: userDate.phoneNumber, userId: userDate._id });
        successResponse.headers["Access-Control-Expose-Headers"] = "access-token,refresh-token";
        return successResponse;

    } catch (err) {
        console.error('handler: users | verifyOtp | error | ', err);
        return helper.getResponseObject(false, HTTP_CODE.BAD_REQUEST, [], "Error: " + err.message);
    }
}