# Groq API Setup Guide

Groq offers **fast, free AI inference** with generous limits. This guide will help you set it up for your Nectar project.

## Why Groq?

- ✅ **FREE Tier**: 14,400 requests/day, 30 requests/minute
- ✅ **Very Fast**: Ultra-low latency inference
- ✅ **High Quality**: Access to models like Llama 3.3 70B
- ✅ **OpenAI-Compatible**: Easy integration

## Setup Steps

### 1. Get Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in (it's free!)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your API key

### 2. Add to Your .env File

Add the following to your `.env` file:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**Note**: You can also keep `GEMINI_API_KEY` as a fallback. The app will try Groq first, then fall back to Gemini if Groq fails.

### 3. Verify Setup

Run the verification script:

```bash
./verify-api-keys.sh
```

You should see:
```
✅ VITE_GROQ_API_KEY - Present (gsk_...)
✅ All required API keys are present!
✅ Using Groq API (FREE tier - 14,400 requests/day)
```

### 4. Test It Out

Start your dev server:

```bash
npm run dev
```

Try generating some side hustle ideas. The app will automatically use Groq if the key is configured!

## How It Works

The app uses a **smart fallback system**:

1. **First**: Tries Groq (if `VITE_GROQ_API_KEY` is set)
2. **Fallback**: Uses Gemini (if `GEMINI_API_KEY` is set)
3. **Error**: Shows friendly error if neither is configured

## Groq Free Tier Limits

- **Requests per day**: 14,400
- **Requests per minute**: 30
- **Models available**: Llama 3.3 70B, Mixtral 8x7B, and more

This is perfect for:
- Development and testing
- Small to medium user bases
- Cost-effective scaling

## Available Models

The app is configured to use `llama-3.3-70b-versatile` by default, which offers:
- Fast inference
- High quality responses
- Good JSON formatting

You can change the model in `lib/groq.ts` if needed.

## Cost Comparison

### Groq (Free Tier)
- 14,400 requests/day = **FREE**
- Perfect for most projects

### Gemini (Free Tier)
- 1,500 requests/day (Flash) = **FREE**
- 100 requests/day (Pro) = **FREE**

### With Paid Subscribers

If you have paying customers ($19/month), you can:
- Use Groq free tier (14,400/day handles ~300-500 active users)
- Monitor usage and upgrade if needed
- Keep Gemini as backup

## Troubleshooting

### "VITE_GROQ_API_KEY is not configured"
- Make sure you added `VITE_GROQ_API_KEY` to your `.env` file
- Restart your dev server after adding the key

### "Groq generation failed"
- Check your API key is valid
- Check Groq console for rate limits
- The app will automatically fall back to Gemini

### Rate Limit Errors
- Groq free tier: 30 requests/minute
- If you hit limits, the app will fall back to Gemini
- Consider implementing request queuing for high traffic

## Next Steps

1. ✅ Get your Groq API key
2. ✅ Add it to `.env`
3. ✅ Test the integration
4. ✅ Monitor usage in Groq console
5. ✅ Consider adding usage analytics

## Resources

- [Groq Console](https://console.groq.com/)
- [Groq Documentation](https://console.groq.com/docs)
- [Groq Pricing](https://groq.com/pricing)

---

**Happy coding! 🚀**

