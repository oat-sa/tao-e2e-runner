module.exports = {
    admin: [
        {
            username: Cypress.env('adminUser') || 'admin',
            password: Cypress.env('adminPass') || 'admin'
        }
    ]
};
