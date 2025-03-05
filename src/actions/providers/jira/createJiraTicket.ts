import axios from "axios";
import {
  AuthParamsType,
  jiraCreateJiraTicketFunction,
  jiraCreateJiraTicketOutputType,
  jiraCreateJiraTicketParamsType,
} from "../../autogen/types";

const createTicket: jiraCreateJiraTicketFunction = async ({
  params,
  authParams,
}: {
  params: jiraCreateJiraTicketParamsType;
  authParams: AuthParamsType;
}): Promise<jiraCreateJiraTicketOutputType> => {
  const { authToken, baseUrl } = authParams;
  const url = `${baseUrl}/rest/api/3/issue`;

  const payload = {
    fields: {
      project: {
        key: params.projectKey,
      },
      summary: params.summary,
      description: params.description,
      issuetype: {
        name: params.issueType,
      },
      ...(params.reporter ? { reporter: { id: params.reporter } } : {}),
    },
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${params.username}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export default createTicket;
