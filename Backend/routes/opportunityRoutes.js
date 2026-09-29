const express= require('express')
const Opportunity= require('../models/Opportunity')

const router= express.Router();

router.get('/',async( req, res)=>{
    try{
        const opportunities= await Opportunity.find()
        res.json(opportunities)
    }
    catch(error){
        res.status(500).json({
            message:"Error fetching opprortunities"
        })
    }
})


//post route

router.post('/', async (req, res) => {
  try {
    const newOpportunity = await Opportunity.create(req.body)

    res.json({
      message: "Opportunity added successfully",
      data: newOpportunity
    })

  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
})




module.exports = router