import { getSoapProvider } from "../SoapApiProvider";

const scheme = (query, queryField, roomType, start, limit, sortBy, sortDir) => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
        <soapenv:Header/>
        <soapenv:Body>
            <v1:SearchRoomsRequest>
            <v1:query>${query}</v1:query>
            <v1:queryField>${queryField}</v1:queryField>
            <v1:roomType>${roomType}</v1:roomType>
            <v1:start>${start}</v1:start>
            <v1:limit>${limit}</v1:limit>
            <v1:sortBy>${sortBy}</v1:sortBy>
            <v1:sortDir>${sortDir}</v1:sortDir>
            </v1:SearchRoomsRequest>
        </soapenv:Body>
        </soapenv:Envelope>`;
};

const soapProvider = getSoapProvider();

export const searchRooms = (
  portal,
  query,
  queryField,
  roomType,
  start,
  limit,
  sortBy,
  sortDir,
  authToken
) => {
  const url = !/^https?:\/\//i.test(portal) ? `https://${portal}` : portal;
  return soapProvider
    .send(
      `${url}/services/v1_1/VidyoPortalUserService/`,
      scheme(query, queryField, roomType, start, limit, sortBy, sortDir),
      "searchRooms",
      authToken
    )
    .then((data) => {
      return data?.Envelope?.Body?.SearchRoomsResponse?.Room;
    })
    .catch((err) => {
      console.error(`searchRooms error -> ${err}`);
    });
};
