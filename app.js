const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;
const initializeDbServerConnection = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("sever running on localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error : ${e.message}`);
  }
};

initializeDbServerConnection();

//function
const convertSnakeCaseToCamelCase = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

//  GET ALL STATES      API - 1         done

app.get("/states/", async (request, response) => {
  const getAllStatesQuery = `
    SELECT 
     *
    FROM
      state;
    `;
  const dbResponse = await db.all(getAllStatesQuery);
  response.send(dbResponse.map((each) => convertSnakeCaseToCamelCase(each)));
});

//  GET             API - 2             done

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getOneStateQuery = `
    SELECT 
      *
    FROM 
      state
    WHERE
      state_id = ${stateId}`;
  const dbResponse = await db.get(getOneStateQuery);
  response.send(convertSnakeCaseToCamelCase(dbResponse));
});

// POST METHOD          API - 3

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addNewDistrictQuery = `
    INSERT INTO 
      district(district_name,state_id, cases, cured, active, deaths)
    VALUES
    (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths},
    );`;
  await db.run(addNewDistrictQuery);
  response.send("District Successfully Added");
});

const convertSnakeToCamelForDistrict = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

//  GET                 API - 4             done

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT
      *
    FROM
      district
    WHERE
      district_id = ${districtId};
    `;
  const dbResponse = await db.get(getDistrictQuery);
  response.send(convertSnakeToCamelForDistrict(dbResponse));
});

// DELETE               API - 5             done

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictIdQuery = `
    DELETE FROM district
    WHERE 
      district_id = ${districtId}
    `;
  await db.run(deleteDistrictIdQuery);
  response.send("District Removed");
});

//PUT district          API - 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictDetails = `
    UPDATE
      district
    SET 
      district_name = '${districtName}',
       stateId =  ${stateId},
       cases = ${cases},
       cured = ${cured},
       active =  ${active},
       deaths = ${deaths}
    WHERE
      district_id = ${districtId}`;
  await db.run(updateDistrictDetails);
  response.send("District Details Updated");
});

// GET              API - 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getOneStateQuery = `
    SELECT 
      sum(cases) as totalCases,
      sum(cured) as totalCured,
      sum(active) as totalActive,
      sum(active) as totalDeaths
    FROM 
      district
    WHERE
      state_id = ${stateId}`;
  const dbResponse = await db.all(getOneStateQuery);
  response.send(dbResponse);
});

// GET              API - 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT
      state_name as stateName
    FROM 
      state
    WHERE
      state_id = ${districtId}`;
  const dbResponse = await db.get(getDistrictQuery);
  response.send(dbResponse);
});

module.exports = app;
