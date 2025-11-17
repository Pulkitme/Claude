import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const testimonials = [
    {
      name: 'Sarah & Mike',
      relationship: 'Together for 3 years',
      content: 'OURS has completely transformed how we manage our relationship. The daily questions have sparked so many meaningful conversations!',
      rating: 5,
      image: '❤️',
    },
    {
      name: 'Emma & James',
      relationship: 'Together for 2 years',
      content: 'We love the shared calendar feature! Never miss a date night or anniversary. The app is beautifully designed and so easy to use.',
      rating: 5,
      image: '💕',
    },
    {
      name: 'Alex & Jordan',
      relationship: 'Together for 5 years',
      content: 'The expense tracker is a game changer. We finally have our finances organized and can see exactly where our money goes each month.',
      rating: 5,
      image: '💝',
    },
  ]

  return (
    <section id="testimonials" className="relative py-24 md:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Loved by <span className="text-gradient">Thousands</span> of Couples
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See what couples around the world are saying about OURS.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative p-8 glass-effect rounded-2xl"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary-500/20" />

              {/* User Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-3xl">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.relationship}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
