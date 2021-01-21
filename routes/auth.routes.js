const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../models/User')
const router = Router()

// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Not valid email').isEmail(),
    check('password', 'Password length should be 6 symbols').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      console.log('REQ', req.body)
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Data is not valid during registration',
        })
      }

      const { email, password } = req.body

      const candidate = await User.findOne({ email: email })

      if (candidate) {
        return res.status(400).json({ message: 'This user already exists' })
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({ email, password: hashedPassword })

      await user.save()

      res.status(201).json({ message: 'User was created' })
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong, try again' })
    }
  }
)

// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Input correct email').normalizeEmail().isEmail(),
    check('password', 'Input your password').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Data is not valid',
        })
      }

      const { email, password } = req.body

      const user = await User.findOne({ email: email })

      if (!user) {
        return res.status(400).json({ message: 'Can`t find this user' })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({ message: 'Wrong password, try again' })
      }

      const token = jwt.sign({ userId: user.id }, config.get('jwtSecret'), {
        expiresIn: '1h',
      })

      res.json({ token, userId: user.id })
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong, try again' })
    }
  }
)

module.exports = router
