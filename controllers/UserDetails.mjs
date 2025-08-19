import GetUserDetailsWithToken from "../helpers/UserDetailsToken.mjs";

async function GetUserDetails(request,response) {
    try {
        const token = request.cookies.token || "";
        const userData = await GetUserDetailsWithToken(token);
        console.log("userdata", userData);
        if(!userData) return response.status(400).send({ success: false , token: false });
        return response.status(200).send({ success: true, userData });
    } catch (error) {
         console.error(error);
         return response.status(500).send({ success: false , message: error.message || error });
    }
}

export default GetUserDetails;