import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Heart,
  Calendar,
  ListChecks,
  MessageCircle,
  DollarSign,
  Camera,
  Lock,
  Zap
} from 'lucide-react'

const Features = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const features = [
    {
      icon: Heart,
      title: 'Shared Timeline',
      description: 'Share photos, videos, voice messages, and special moments in your private timeline. React with hearts and keep your memories alive.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Calendar,
      title: 'Shared Calendar',
      description: 'Never miss an anniversary or date night. Manage events together with reminders, recurring dates, and color-coded categories.',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: ListChecks,
      title: 'Smart Lists',
      description: 'Create to-do lists, shopping lists, and bucket lists together. Assign tasks, mark completions, and achieve goals as a team.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageCircle,
      title: 'Daily Questions',
      description: 'Strengthen your bond with 50+ thoughtful relationship questions. Answer daily and discover new things about each other.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: DollarSign,
      title: 'Money Manager',
      description: 'Track shared expenses effortlessly. Split costs, categorize spending, and view monthly summaries with beautiful charts.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Camera,
      title: 'Media Sharing',
      description: 'Upload unlimited photos and videos. Everything is securely stored and accessible only to you and your partner.',
      gradient: 'from-red-500 to-pink-500',
    },
  ]

  const benefits = [
    {
      icon: Lock,
      title: 'Private & Secure',
      description: 'End-to-end encryption ensures your data stays between you two.',
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'All updates sync instantly across devices for both partners.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section id="features" className="relative py-24 md:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Everything You Need,
            <br />
            <span className="text-gradient">All in One Place</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            OURS brings together all the tools couples need to stay connected, organized, and in love.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative p-8 glass-effect rounded-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-gradient transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity blur-xl`}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              whileHover={{ scale: 1.03 }}
              className="flex items-start space-x-4 p-6 glass-effect rounded-xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{benefit.title}</h4>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
