import Drop from "../models/dropModel.js"

export const getAllDrops = async (req,res) => {
    const drops = await Drop.find()
    res.status(200).json(drops)
}