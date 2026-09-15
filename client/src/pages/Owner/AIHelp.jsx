import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AIHelp = () => {
  const { axios } = useAppContext()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am CarRental AI Help. Ask me about cars, bookings, availability, payments, or using the dashboard.' }
  ])

  const sendMessage = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const { data } = await axios.post('/api/ai/help', { messages: nextMessages })
      if (data.success) {
        setMessages([...nextMessages, { role: 'assistant', content: data.reply }])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    'How do I book a car?',
    'How does eSewa payment work?',
    'How can I manage bookings?'
  ]

  return (
    <div className='px-4 pt-10 md:px-10 w-full flex-1'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-gray-800'>AI Help</h1>
          <p className='text-gray-500 mt-1'>Simple help for your CarRental website.</p>
        </div>

        <div className='bg-white border border-borderColor rounded-xl overflow-hidden shadow-sm'>
          <div className='h-[55vh] min-h-100 overflow-y-auto p-4 md:p-6 space-y-4'>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-6 ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-700 rounded-bl-sm'}`}>
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className='flex justify-start'>
                <div className='px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 text-gray-500 text-sm'>AI is thinking...</div>
              </div>
            )}
          </div>

          <div className='border-t border-borderColor p-4'>
            <div className='flex flex-wrap gap-2 mb-3'>
              {quickQuestions.map(question => (
                <button
                  key={question}
                  type='button'
                  onClick={() => setInput(question)}
                  className='text-xs px-3 py-2 rounded-full border border-borderColor text-gray-600 hover:text-primary hover:border-primary transition'
                >
                  {question}
                </button>
              ))}
            </div>

            <form onSubmit={sendMessage} className='flex gap-2'>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder='Ask about CarRental...'
                className='flex-1 border border-borderColor rounded-lg px-4 py-3 outline-none focus:border-primary'
              />
              <button
                type='submit'
                disabled={loading || !input.trim()}
                className='px-5 py-3 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIHelp
