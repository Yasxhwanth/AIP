/**
 * Test script to verify Gemini 2.0 Flash integration
 */

import { GeminiClient } from './src/ai/GeminiClient';

async function testGeminiFlash() {
    console.log('Testing Gemini 2.0 Flash Integration...');
    
    const client = GeminiClient.getInstance();
    
    if (!client.isAvailable()) {
        console.log('⚠️  Gemini client not available - check VITE_GEMINI_API_KEY');
        console.log('   Set environment variable: export VITE_GEMINI_API_KEY=your_api_key');
        return;
    }
    
    console.log('✅ Gemini client is available');
    console.log('   Model: gemini-2.0-flash');
    
    // Create a simple test context
    const testContext = {
        timestamp: new Date(),
        viewContext: 'manual' as const,
        selectedEntityIds: []
    };
    
    try {
        console.log('\n🧪 Running test query...');
        const result = await client.generateAdvisory(
            "What are the key features of the Gemini 2.0 Flash model?",
            testContext
        );
        
        if (result) {
            console.log('✅ Test successful!');
            console.log('📊 Response length:', result.content.length, 'characters');
            console.log('📁 Data sources:', result.dataSources);
            console.log('\n💡 Sample response (first 100 chars):');
            console.log(result.content.substring(0, 100) + '...');
        } else {
            console.log('❌ Test failed - no response received');
        }
    } catch (error) {
        console.error('❌ Test error:', error);
    }
    
    // Test streaming capability if available
    console.log('\n🧪 Testing streaming capability...');
    try {
        const streamResult = await client.generateAdvisoryStream(
            "Name three benefits of using Gemini 2.0 Flash.",
            testContext
        );
        
        if (streamResult) {
            console.log('✅ Streaming capability available');
            
            // Note: Actually consuming the stream would require more complex handling
            // For now, we just verify the method returns a stream object
        } else {
            console.log('⚠️  Streaming capability not available');
        }
    } catch (error) {
        console.log('⚠️  Streaming test error (expected if API key not set):', error);
    }
    
    console.log('\n🎯 Integration test completed!');
}

// Run the test
testGeminiFlash().catch(console.error);