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


router.get('/:id', async (req, res) => {

  try {

    const opportunity = await Opportunity.findById(req.params.id)
      if(!opportunity){
        return res.status(404).json({
          message: "Opportunity is not found"
        })
      }
     res.json(opportunity)

    res.json(opportunity)

  } catch (error) {

    res.status(500).json({
      message: "Error fetching opportunity"
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


// delete Route

router.delete('/:id', async( req, res)=>{
  try{
    await Opportunity.findByIdAndDelete(req.params.id)

    res.json({
      message:"Opportunity deleted successfully"
    })

  }
  catch(error){
    res.status(500).json({
      message:"Error deleting opportunity"
    })
  }
})


module.exports = router