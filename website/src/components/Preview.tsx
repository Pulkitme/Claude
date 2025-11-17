import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Smartphone, Tablet, Monitor } from 'lucide-react'

const Preview = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const steps = [
    {
      number: '01',
      title: 'Sign Up Together',
      description: 'Create your accounts and connect with a unique invite code.',
    },
    {
      number: '02',
      title: 'Customize Your Space',
      description: 'Set up your profile, preferences, and start sharing moments.',
    },
    {
      number: '03',
      title: 'Stay Connected',
      description: 'Use all features to organize your life and strengthen your bond.',
    },
  ]

  return (
    <section id="preview" className="relative py-24 md:py-32 overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            How <span className="text-gradient">OURS</span> Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Getting started is simple. In just three easy steps, you and your partner can begin your journey together.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent"></div>
              )}

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 glass-effect rounded-2xl mb-6">
                  <span className="text-4xl font-bold text-gradient">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Device Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Mock Device Frame */}
          <div className="relative glass-effect rounded-3xl p-4 md:p-8">
            <div className="aspect-video bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl flex items-center justify-center overflow-hidden">
              {/* Mockup Content */}
              <div className="w-full h-full flex items-center justify-center space-x-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="glass-effect rounded-2xl p-6 max-w-sm"
                >
                  <div className="w-full h-48 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl mb-4 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-primary-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="hidden md:block glass-effect rounded-2xl p-6 max-w-sm"
                >
                  <div className="w-full h-48 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-xl mb-4 flex items-center justify-center">
                    <Tablet className="w-16 h-16 text-primary-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Platform Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center justify-center space-x-8 mt-8"
          >
            {[
              { icon: Smartphone, label: 'iOS' },
              { icon: Smartphone, label: 'Android' },
              { icon: Monitor, label: 'Web' },
            ].map((platform) => (
              <div key={platform.label} className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 glass-effect rounded-xl flex items-center justify-center">
                  <platform.icon className="w-6 h-6 text-primary-400" />
                </div>
                <span className="text-sm text-gray-400">{platform.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Preview
