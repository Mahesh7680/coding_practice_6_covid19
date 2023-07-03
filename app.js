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

module.exports = app;

//function
const convertSnakeCaseToCamelCase = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

//  GET ALL STATES      API - 1

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

//  GET             API - 2

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
    )
    `;
  await db.run(addNewDistrictQuery);
  response.send("District Successfully Added");
});

const convertSnakeToCamelForDistrict = (dbObject) => {
  return {
    districtName: district_name.dbObject,
    stateId: state_id.dbObject,
    cases: cases.dbObject,
    cured: cured.dbObject,
    active: active.dbObject,
    deaths: deaths.dbObject,
  };
};

//  GET                 API - 4

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
  response.send(dbResponse.map(each) => convertSnakeToCamelForDistrict(each));
});

// DELETE               API - 5

app.delete("/districts/:districtId/", async (request, response) => {
    const {districtId} = request.params
    const deleteDistrictIdQuery =`
    DELETE FROM districts
    WHERE 
      district_id = ${districtId}
    `
    await db.run(deleteDistrictIdQuery)
    response.send("District Removed")
})

//PUT district          API - 6

app.push("/districts/:districtId/", async (request, response) => {
    const {districtId} = request.params
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
      district_id = ${districtId}
    `
    await db.run(updateDistrictDetails)
    response.send("District Details Updated")
})

// GET              API - 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getOneStateQuery = `
    SELECT 
      SUM(cases) as totalCases,
      SUM(cured) as totalCured,
      SUM(active) as totalActive,
      SUM(active) as totalDeaths
    FROM 
      state
    WHERE
      state_id = ${stateId}`;
  const dbResponse = await db.all(getOneStateQuery);
  response.send((dbResponse));
});

// GET              API - 8

app.get("/districts/:districtId/details/", async (request, response) => {
    const {districtId} = request.params
    const getDistrictQuery = `
    SELECT
      state_name as stateName
    FROM 
      state
    WHERE
      state_id = ${districtId}
    
    `
    const dbResponse = await db.get(getDistrictQuery)
    response.send(dbResponse)
})