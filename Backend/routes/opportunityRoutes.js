
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// 1. Get all opportunities
router.get('/', async (req, res) => {
    try {
        const opportunities = await Opportunity.find();

        res.status(200).json(opportunities);
    } catch (error) {
        console.error('Get opportunities error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch opportunities'
        });
    }
});


// 2. Get recommended opportunities based on student skills
// IMPORTANT: This route must be before GET /:id
router.get('/recommended/matches', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Convert student skills to lowercase strings
        const studentSkills = (user.skills || [])
            .map(skill => {
                if (typeof skill === 'string') {
                    return skill.trim().toLowerCase();
                }

                return (skill.name || '').trim().toLowerCase();
            })
            .filter(Boolean);

        // Get all opportunities
        const opportunities = await Opportunity.find();

        // Calculate matching percentage for each opportunity
        const recommendations = opportunities.map(opportunity => {
            const requiredSkills = (opportunity.requiredSkills || [])
                .map(skill => skill.trim().toLowerCase())
                .filter(Boolean);

            const matchedSkills = requiredSkills.filter(skill =>
                studentSkills.includes(skill)
            );

            const missingSkills = requiredSkills.filter(skill =>
                !studentSkills.includes(skill)
            );

            const matchPercentage = requiredSkills.length === 0
                ? 0
                : Math.round(
                    (matchedSkills.length / requiredSkills.length) * 100
                );

            return {
                ...opportunity.toObject(),
                matchedSkills,
                missingSkills,
                matchPercentage
            };
        });

        // Highest matching percentage first
        recommendations.sort(
            (a, b) => b.matchPercentage - a.matchPercentage
        );

        res.status(200).json({
            message: 'Opportunity matches fetched successfully',
            data: recommendations
        });

    } catch (error) {
        console.error('Opportunity matching error:', error.message);

        res.status(500).json({
            message: 'Failed to calculate opportunity matches'
        });
    }
});


// 3. Get one opportunity by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid opportunity ID'
            });
        }

        const opportunity = await Opportunity.findById(id);

        if (!opportunity) {
            return res.status(404).json({
                message: 'Opportunity not found'
            });
        }

        res.status(200).json(opportunity);

    } catch (error) {
        console.error('Get opportunity error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch opportunity'
        });
    }
});


// 4. Create opportunity (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const {
            title,
            company,
            location,
            type,
            requiredSkills
        } = req.body;

        const opportunity = await Opportunity.create({
            title,
            company,
            location,
            type,
            requiredSkills
        });

        res.status(201).json({
            message: 'Opportunity created successfully',
            data: opportunity
        });

    } catch (error) {
        console.error('Create opportunity error:', error.message);

        res.status(400).json({
            message: 'Failed to create opportunity',
            error: error.message
        });
    }
});


// 5. Update opportunity (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid opportunity ID'
            });
        }

        const opportunity = await Opportunity.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!opportunity) {
            return res.status(404).json({
                message: 'Opportunity not found'
            });
        }

        res.status(200).json({
            message: 'Opportunity updated successfully',
            data: opportunity
        });

    } catch (error) {
        console.error('Update opportunity error:', error.message);

        res.status(400).json({
            message: 'Failed to update opportunity',
            error: error.message
        });
    }
});


// 6. Delete opportunity (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid opportunity ID'
            });
        }

        const opportunity = await Opportunity.findByIdAndDelete(id);

        if (!opportunity) {
            return res.status(404).json({
                message: 'Opportunity not found'
            });
        }

        res.status(200).json({
            message: 'Opportunity deleted successfully'
        });

    } catch (error) {
        console.error('Delete opportunity error:', error.message);

        res.status(500).json({
            message: 'Failed to delete opportunity'
        });
    }
});


// 7. Save an opportunity
router.post('/:id/save', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid opportunity ID'
            });
        }

        const opportunity = await Opportunity.findById(id);

        if (!opportunity) {
            return res.status(404).json({
                message: 'Opportunity not found'
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const alreadySaved = user.savedOpportunities.some(
            savedId => savedId.toString() === id
        );

        if (alreadySaved) {
            return res.status(200).json({
                message: 'Opportunity already saved'
            });
        }

        user.savedOpportunities.push(opportunity._id);
        await user.save();

        res.status(200).json({
            message: 'Opportunity saved successfully'
        });

    } catch (error) {
        console.error('Save opportunity error:', error.message);

        res.status(500).json({
            message: 'Failed to save opportunity'
        });
    }
});


// 8. Unsave an opportunity
router.delete('/:id/save', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid opportunity ID'
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        user.savedOpportunities = user.savedOpportunities.filter(
            savedId => savedId.toString() !== id
        );

        await user.save();

        res.status(200).json({
            message: 'Opportunity removed from saved list'
        });

    } catch (error) {
        console.error('Unsave opportunity error:', error.message);

        res.status(500).json({
            message: 'Failed to remove saved opportunity'
        });
    }
});

module.exports = router;
