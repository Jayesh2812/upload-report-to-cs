const core = require("@actions/core");
const github = require("@actions/github");
const FormData = require("form-data");
const fs = require("fs");
const fetch = require("node-fetch");
const axios = require("axios").default;

try {
  const managementToken = core.getInput("management_token", { required: true });
  const apiKey = core.getInput("api_key", { required: true });
  const path = core.getInput("path", { required: true });
  const parentUid = core.getInput("parent_folder_uid");

  const time = new Date().toTimeString();
  console.log({ managementToken, apiKey, parentUid, path });

  postReport({ managementToken, apiKey, parentUid, path });

  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  // console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

async function postReport({ managementToken, apiKey, parentUid, path }) {
  var data = new FormData();
  data.append("asset[upload]", fs.createReadStream(`${path}index.html`));
  data.append("asset[parent_uid]", parentUid);

  var config = {
    method: "post",
    url: "https://api.contentstack.io/v3/assets",
    headers: {
      api_key: apiKey,
      authorization: managementToken,
      "Content-Type": "multipart/form-data",
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      const url = response.data.asset.url;
      core.setOutput("link", url)
      console.log(url);
    })
    .catch(function (error) {
      core.setFailed(error.response.data)
      console.log(error.response.data)
    });
}


