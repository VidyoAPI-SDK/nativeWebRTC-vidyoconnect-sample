import { getSoapProvider } from "../SoapApiProvider";

const scheme = (
  params
) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
   <soapenv:Header/>
   <soapenv:Body>
      <v1:LogInRequest>
         <!--Optional:-->
         <v1:returnEndpointBehavior>${
           params.returnEndpointBehavior || false
         }</v1:returnEndpointBehavior>
         <!--Optional:-->
         <v1:returnAuthToken>${
           params.returnAuthToken || false
         }</v1:returnAuthToken>
         <!--Optional:-->
         <v1:returnPortalVersion>${
           params.returnPortalVersion || false
         }</v1:returnPortalVersion>
         <!--Optional:-->
         <v1:returnServiceAddress>${
           params.returnServiceAddress || false
         }</v1:returnServiceAddress>
         <!--Optional:-->
         <v1:returnNeoRoomPermanentPairingDeviceUserAttribute>${
           params.returnNeoRoomPermanentPairingDeviceUserAttribute || false
         }</v1:returnNeoRoomPermanentPairingDeviceUserAttribute>
         <!--Optional:-->
         <v1:returnUserRole>${
           params.returnUserRole || false
         }</v1:returnUserRole>
         <!--Optional:-->
         <v1:returnJwtTokens>${
           params.returnJwtTokens || false
         }</v1:returnJwtTokens>
         <!--Optional:-->
         ${
           params.endpointGuid &&
           `<v1:endpointGuid>${params.endpointGuid}</v1:endpointGuid>`
         }
      </v1:LogInRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

const soapProvider = getSoapProvider();

export const Login = (portal, token, params = {}) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(params),
      "Login",
      token
    )
    .then((data) => {
      return data?.Envelope?.Body?.LogInResponse;
    })
    .catch((err) => {
      console.error(`LoginRequest error -> ${err}`);
    });
};
