import { defaultAdminRegionFields, defaultAdminRegionRelations } from "."

import { EntityManager } from "typeorm"
import { IsString } from "class-validator"
import { Region } from "../../../.."
import RegionService from "../../../../services/region"
import { validator } from "../../../../utils/validator"

/**
 * @oas [post] /admin/regions/{id}/countries
 * operationId: "PostRegionsRegionCountries"
 * summary: "Add Country"
 * description: "Add a Country to the list of Countries in a Region."
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} The ID of the Region.
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         $ref: "#/components/schemas/AdminPostRegionsRegionCountriesReq"
 * x-codegen:
 *   method: addCountry
 * x-codeSamples:
 *   - lang: TypeScript
 *     label: JS Client
 *     source: |
 *       import Medusa from "@medusajs/medusa-js"
 *       const medusa = new Medusa({ baseUrl: MEDUSA_BACKEND_URL, maxRetries: 3 })
 *       // must be previously logged in or use api token
 *       medusa.admin.regions.addCountry(regionId, {
 *         country_code: "dk"
 *       })
 *       .then(({ region }) => {
 *         console.log(region.id);
 *       })
 *   - lang: TypeScript
 *     label: Medusa React
 *     source: |
 *       import { useAdminRegionAddCountry } from "medusa-react"
 *
 *       type Props = {
 *         regionId: string
 *       }
 *
 *       const Region = ({
 *         regionId
 *       }: Props) => {
 *         const addCountry = useAdminRegionAddCountry(regionId)
 *         // ...
 *
 *         const handleAddCountry = (
 *           countryCode: string
 *         ) => {
 *           addCountry.mutate({
 *             country_code: countryCode
 *           }, {
 *             onSuccess: ({ region }) => {
 *               console.log(region.countries)
 *             }
 *           })
 *         }
 *
 *         // ...
 *       }
 *
 *       export default Region
 *   - lang: Shell
 *     label: cURL
 *     source: |
 *       curl -X POST '{backend_url}/admin/regions/{region_id}/countries' \
 *       -H 'x-medusa-access-token: {api_token}' \
 *       -H 'Content-Type: application/json' \
 *       --data-raw '{
 *           "country_code": "dk"
 *       }'
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * tags:
 *   - Regions
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           $ref: "#/components/schemas/AdminRegionsRes"
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 */
export default async (req, res) => {
  const { region_id } = req.params
  const validated = await validator(
    AdminPostRegionsRegionCountriesReq,
    req.body
  )

  const regionService: RegionService = req.scope.resolve("regionService")
  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await regionService
      .withTransaction(transactionManager)
      .addCountry(region_id, validated.country_code)
  })

  const region: Region = await regionService.retrieve(region_id, {
    select: defaultAdminRegionFields,
    relations: defaultAdminRegionRelations,
  })

  res.status(200).json({ region })
}

/**
 * @schema AdminPostRegionsRegionCountriesReq
 * type: object
 * description: "The details of the country to add to the region."
 * required:
 *   - country_code
 * properties:
 *   country_code:
 *     description: "The 2 character ISO code for the Country."
 *     type: string
 *     externalDocs:
 *       url: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements
 *       description: See a list of codes.
 */
export class AdminPostRegionsRegionCountriesReq {
  @IsString()
  country_code: string
}
