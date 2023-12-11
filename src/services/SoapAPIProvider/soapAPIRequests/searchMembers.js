import { getSoapProvider } from "../SoapApiProvider";

const scheme = (
  query,
  queryField,
  memberType,
  start,
  limit,
  sortBy,
  sortDir
) => {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://portal.vidyo.com/user/v1_1">
        <soapenv:Header/>
        <soapenv:Body>
            <v1:SearchMembersRequest>
            <v1:query>${query}</v1:query>
            <v1:queryField>${queryField}</v1:queryField>
            <v1:memberType>${memberType}</v1:memberType>
            <v1:start>${start}</v1:start>
            <v1:limit>${limit}</v1:limit>
            <v1:sortBy>${sortBy}</v1:sortBy>
            <v1:sortDir>${sortDir}</v1:sortDir>
            </v1:SearchMembersRequest>
        </soapenv:Body>
        </soapenv:Envelope>`;
};

const soapProvider = getSoapProvider();

export const searchMembers = (
  portal,
  query,
  queryField,
  memberType,
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
      scheme(query, queryField, memberType, start, limit, sortBy, sortDir),
      "searchMembers",
      authToken
    )
    .then((data) => {
      return data?.Envelope?.Body?.SearchMembersResponse?.Member;
    })
    .catch((err) => {
      console.error(`searchMembers error -> ${err}`);
    });
};
