Cypress.Commands.add('createTest', fixturePath => {
    const env = Cypress.env();
    let authData;

    return cy.request({
        method: 'POST',
        url: `${env.api}auth/access-tokens`,
        form: true,
        body: {
            grant_type: "client_credentials",
            scope: "",
            client_id: env.clientId,
            client_secret: env.clientSecret
        }
    }).then(response => {
        authData = response.body;

        return cy.fixture(fixturePath);
    }).then((fixtureData) => {
        return cy.request({
            method: 'POST',
            url: `${env.api}publications`,
            auth: {
                bearer: authData.access_token
            },
            body: fixtureData
        })
    }).then(response => {
        return cy.wait(1000).then(() => cy.request({
            method: 'GET',
            url: response.body.data.url,
            auth: {
                bearer: authData.access_token
            }
        }))
    }).then(response => {
        return cy.wait(1000).then(() => cy.request({
            method: 'POST',
            url: env.ltiLink,
            form: true,
            body: {}
        }))

        // return cy.wait(1000).then(() => cy.request({
        //     method: 'POST',
        //     url: `http://localhost:8001/api/v1/auth/launch-lti/${response.body.data.deliveryId}`,
        //     form: true,
        //     body: data
        // }))
    })
})
