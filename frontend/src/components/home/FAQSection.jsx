import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "Is EthioCode free to use?",
    answer: "Yes! Our free tier includes 100+ coding challenges and community access. No credit card required to start learning.",
  },
  {
    question: "Do you offer certificates?",
    answer: "Yes, you'll earn verifiable certificates upon completing learning paths and courses. These certificates are shareable on LinkedIn and recognized by our partner companies.",
  },
  {
    question: "Can I get a job through EthioCode?",
    answer: "Absolutely! We connect you with 500+ Ethiopian companies actively hiring developers. Many of our community members have landed jobs at Google, Microsoft, Chapa, and Safaricom.",
  },
  {
    question: "What languages are available?",
    answer: "The platform is currently available in English and Amharic. We're working on adding more Ethiopian languages to make coding education accessible to everyone.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee on all paid plans. No questions asked - if EthioCode isn't for you, we'll refund your payment.",
  },
  {
    question: "How do I contact support?",
    answer: "You can email us at support@ethiocode.com or join our Discord community for quick help from our team and other developers.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Everything you need to know about EthioCode
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                <FaChevronDown
                  className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:support@ethiocode.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all hover:scale-105"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
