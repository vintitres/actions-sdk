import axios, { AxiosInstance } from "axios";
import {
  confluenceUpdatePageFunction,
  confluenceUpdatePageParamsType,
  confluenceUpdatePageOutputType,
  AuthParamsType,
} from "../../../actions/autogen/types";

function getConfluenceApi(baseUrl: string, username: string, apiToken: string): AxiosInstance {
  const api: AxiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
      Accept: "application/json",
      // Tokens are associated with a specific user.
      Authorization: `Basic ${Buffer.from(`${username}:${apiToken}`).toString("base64")}`,
    },
  });
  return api;
}

const confluenceUpdatePage: confluenceUpdatePageFunction = async ({
  params,
  authParams,
}: {
  params: confluenceUpdatePageParamsType;
  authParams: AuthParamsType;
}): Promise<confluenceUpdatePageOutputType> => {
  const { pageId, username, content, title } = params;
  const { baseUrl, authToken } = authParams;

  const api = getConfluenceApi(baseUrl!, username, authToken!);

  // Get current version number
  const response = await api.get(`/api/v2/pages/${pageId}`);
  const currVersion = response.data.version.number;

  await api.put(`/api/v2/pages/${pageId}`, {
    id: pageId,
    status: "current",
    title,
    body: {
      representation: "storage",
      value: content,
    },
    version: {
      number: currVersion + 1,
    },
  });
};

export default confluenceUpdatePage;
