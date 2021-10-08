const ProductFixture = global.ProductFixtureService;
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Takes a snapshot for percy visual testing
 * @memberOf Cypress.Chainable#
 * @name takeSnapshot
 * @param {String} title - Title of the screenshot
 * @param {String} [selectorToCheck = null] - Unique selector to make sure the module is ready for being snapshot
 * @param {Object} [width = null] - Screen width used for snapshot
 * @function
 */
Cypress.Commands.add('takeSnapshot', (title, selectorToCheck = null, width = { widths: [375, 768, 1920] }) => {
    if (!Cypress.env('usePercy')) {
        return;
    }

    if (selectorToCheck) {
        cy.get(selectorToCheck).should('be.visible');
    }

    if (!width) {
        cy.percySnapshot(title);
        return;
    }
    cy.percySnapshot(title, width);
});

/**
 * Cleans up any previous state by restoring database and clearing caches
 * @memberOf Cypress.Chainable#
 * @name cleanUpPreviousState
 * @function
 */
Cypress.Commands.overwrite('cleanUpPreviousState', (orig) => {
    if (Cypress.env('localUsage')) {
        return cy.exec(`${Cypress.env('shopwareRoot')}/bin/console e2e:restore-db`)
            .its('code').should('eq', 0);
    }

    return orig();
});

/**
 * Patch to update via admin api
 * @memberOf Cypress.Chainable#
 * @name patchViaAdminApi
 * @param {String} [endpoint = null] - Endpoint to patch
 * @param {Object} [data = null] - Data send to API
 * @function
 */
Cypress.Commands.add('patchViaAdminApi', (endpoint, data) => {
    return cy.requestAdminApi(
        'PATCH',
        `/api/${endpoint}?response=true`,
        data
    ).then((responseData) => {
        return responseData;
    });
});

/**
 * Create custom product fixture using Shopware API at the given endpoint
 * @memberOf Cypress.Chainable#
 * @name createCustomProductFixture
 * @function
 * @param {Object} [userData={}] - Options concerning creation
 * @param [String] [templateFixtureName = 'product'] - Specifies the base fixture name
 */
Cypress.Commands.add('createCustomProductFixture', (userData = {}, templateFixtureName = 'product', categoryName = 'Confirm input catalogue') => {
    const fixture = ProductFixture;

    return cy.fixture(templateFixtureName).then((result) => {
        return Cypress._.merge(result, userData);
    }).then((data) => {
        return fixture.setProductFixture(data, categoryName);
    });
});

Cypress.Commands.add('initializePluginConfig', (config, endpoint) => {
    return cy.fixture(config).then((data) => {
        return cy.requestAdminApi(
            'POST',
            endpoint,
            {
                data
            }
        )
    });
});

Cypress.Commands.add('updatePluginConfig', (data, salesChannelId) => {
    return cy.requestAdminApi(
        'POST',
        `/api/_action/system-config?salesChannelId=${salesChannelId}`,
        {
            data: {
                [`SwagAmazonPay.settings.${data.key}`]: data.value
            }
        }
    );
});

/**
 * Sets the specific shipping method as default in sales channel
 * @memberOf Cypress.Chainable#
 * @name setShippingMethodInSalesChannel
 * @param {String} name - Name of the shipping method
 * @param {String} [salesChannel = Storefront]  - Name of the sales channel
 * @function
 */
Cypress.Commands.add('setShippingMethodInSalesChannel', (name, salesChannel = 'Storefront') => {
    let salesChannelId;

    // We need to assume that we're already logged in, so make sure to use loginViaApi command first
    return cy.searchViaAdminApi({
        endpoint: 'sales-channel',
        data: {
            field: 'name',
            value: salesChannel,
        },
    }).then((data) => {
        salesChannelId = data.id;

        return cy.searchViaAdminApi({
            endpoint: 'shipping-method',
            data: {
                field: 'name',
                value: name,
            },
        });
    }).then((data) => {
        return cy.updateViaAdminApi('sales-channel', salesChannelId, {
            data: {
                shippingMethodId: data.id,
            },
        });
    });
});

/**
 * Updates an existing entity using Shopware API at the given endpoint
 * @memberOf Cypress.Chainable#
 * @name changeElementStyling
 * @function
 * @param {String} selector - API endpoint for the request
 * @param {String} imageStyle - API endpoint for the request
 */

Cypress.Commands.add('changeElementStyling', (selector, elementStyle) => {
    cy.get(selector)
        .invoke('attr', 'style', elementStyle)
        .should('have.attr', 'style', elementStyle);
});

/**
 * Logs in silently using Shopware API
 * @memberOf Cypress.Chainable#
 * @name createReviewFixture
 * @function
 */
 Cypress.Commands.add('createReviewFixture', () => {
    // TODO move into e2e-testsuite-platform and use own service completely

    let reviewJson = null;
    let productId = '';
    let customerId = '';
    let salesChannelId = '';

    return cy.fixture('product-review').then((data) => {
        reviewJson = data;

        return cy.getCookie('bearerAuth');
    }).then((result) => {
        const headers = {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${JSON.parse(result.value).access}`,
            'Content-Type': 'application/json'
        };

        cy.createProductFixture().then(() => {
            return cy.createCustomerFixture();
        }).then((data) => {
            customerId = data.id;

            return cy.searchViaAdminApi({
                endpoint: 'product',
                data: {
                    field: 'name',
                    value: 'Product name'
                }
            });
        }).then((data) => {
            productId = data.id;

            return cy.searchViaAdminApi({
                endpoint: 'sales-channel',
                data: {
                    field: 'name',
                    value: 'Storefront'
                }
            });
        }).then((data) => {
            salesChannelId = data.id;

            return cy.searchViaAdminApi({
                endpoint: 'language',
                data: {
                    field: 'name',
                    value: 'English'
                }
            });
        }).then((data) => {
            cy.request({
                url: '/api/product-review',
                method: 'POST',
                headers: headers,
                body: Cypress._.merge(reviewJson, {
                    customerId: customerId,
                    languageId: data.id,
                    productId: productId,
                    salesChannelId: salesChannelId
                })
            });
        });
    });
});

/**
 * Creates a variant product based on given fixtures "product-variants.json", 'tax,json" and "property.json"
 * with minor customisation
 * @memberOf Cypress.Chainable#
 * @name createProductVariantFixture
 * @function
 */
Cypress.Commands.add('createProductVariantFixture', () => {
    return cy.createDefaultFixture('tax', {
        id: '91b5324352dc4ee58ec320df5dcf2bf4',
    }).then(() => {
        return cy.createPropertyFixture({
            options: [{
                id: '15532b3fd3ea4c1dbef6e9e9816e0715',
                name: 'Red',
            }, {
                id: '98432def39fc4624b33213a56b8c944d',
                name: 'Green',
            }],
        });
    }).then(() => {
        return cy.createPropertyFixture({
            name: 'Size',
            options: [{ name: 'S' }, { name: 'M' }, { name: 'L' }],
        });
    }).then(() => {
        return cy.searchViaAdminApi({
            data: {
                field: 'name',
                value: 'Storefront',
            },
            endpoint: 'sales-channel',
        });
    }).then((saleschannel) => {
        cy.createDefaultFixture('product', {
            visibilities: [{
                visibility: 30,
                salesChannelId: saleschannel.id,
            }],
        }, 'product-variants.json');
    });
});
