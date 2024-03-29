const { z, createValidator } = require('zod');

let latitudeMsg = { message: 'Must be in range: [-90, 90]' };
let longitudeMsg = { message: 'Must be in range [-180, 180]' };

const paramsSchema = z
    .object({
        lat: z.coerce
            .number()
            .gte(-90, latitudeMsg)
            .lte(90, latitudeMsg)
            .optional(), //[-90, 90]
        lon: z.coerce
            .number()
            .gte(-180, longitudeMsg)
            .lte(180, longitudeMsg)
            .optional(), //[-180, 180]
        radius: z.coerce.number().nonnegative().optional(), // >= 0
        keyword: z.string().optional(),
        genre: z.string().optional(),
        subgenere: z.string().optional(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
    })
    .refine((schema) => {
        return !(
            (schema.lat === undefined && schema.lon !== undefined) ||
            (schema.lon === undefined && schema.lat !== undefined)
        );
    }, 'lat and long need to be specified together');

const idSchema = z.string(); //.regex(new RegExp(/^[a-zA-Z0-9]+$/));

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const purchaseSchema = z.object({
    cart: z.record(z.string(), z.coerce.number()),
    event_id: z.string(),
});

const couponSchema = z.object({
    code: z.string(),
});

module.exports = {
    paramsSchema,
    idSchema,
    signupSchema,
    purchaseSchema,
    couponSchema,
};
