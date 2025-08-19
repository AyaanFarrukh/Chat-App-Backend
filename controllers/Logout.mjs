async function LogOut(request,response) {
    try {
        const cookiesOption = {
            http: true,
            secure: true
        }
        return response.cookie("token","",cookiesOption).status(200).send({
            success: true,
            loggedOut: true
        })
    } catch (error) {
        console.error(error);
        return response.status(500).send({ success: false , message: error.message || error });
    }
}
export default LogOut;