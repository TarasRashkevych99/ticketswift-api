const { z, createValidator } = require("zod");

//  Definiamo tutti gli schema degli oggettti (nomi espliciti)
//  if (!validationService.nomeSchema.parseSafe(input).success)  
//        return 400 (invalid data)
let latitudeMsg = { message: "Must be in range: [-90, 90]" };
let longitudeMsg = { message: "Must be in range [-180, 180]" };


//TODO cambiare il range della longitudine

const paramsSchema = z.object({
    lat: z.coerce.number().gte(-90, latitudeMsg).lte(90, latitudeMsg).optional(), //[-90, 90]
    lon: z.coerce.number().nonnegative(longitudeMsg).lte(180, longitudeMsg).optional(), //[-180, 180]
    radius: z.coerce.number().nonnegative().optional(), // >= 0
    keyword: z.string().optional(),
    genre: z.string().optional(),
    subgenere: z.string().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});


module.exports = {paramsSchema};