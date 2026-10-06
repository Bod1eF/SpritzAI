/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DupeController } from './../dupe/dupeController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "FindDupesResponse": {
        "dataType": "refObject",
        "properties": {
            "targetName": {"dataType":"string","required":true},
            "targetCategory": {"dataType":"string","required":true},
            "targetCopy": {"dataType":"string"},
            "targetImage": {"dataType":"string"},
            "targetPrice": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},
            "dupeName": {"dataType":"string"},
            "dupeCategory": {"dataType":"string"},
            "dupeLink": {"dataType":"string"},
            "dupeBrand": {"dataType":"string"},
            "dupeCopy": {"dataType":"string"},
            "dupeImage": {"dataType":"string"},
            "dupePrice": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"double"}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "error": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FindDupesRequest": {
        "dataType": "refObject",
        "properties": {
            "url": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsDupeController_findDupes: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"FindDupesRequest"},
        };
        app.post('/api/v1/dupe/search',
            ...(fetchMiddlewares<RequestHandler>(DupeController)),
            ...(fetchMiddlewares<RequestHandler>(DupeController.prototype.findDupes)),

            async function DupeController_findDupes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDupeController_findDupes, request, response });

                const controller = new DupeController();

              await templateService.apiHandler({
                methodName: 'findDupes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
