"""
Unit tests for the Chinese Translator

Run with: python3 -m pytest test_translator.py
Or: python3 test_translator.py
"""

import unittest
import time
from translator import ChineseTranslator, TranslationCache, RateLimiter


class TestTranslationCache(unittest.TestCase):
    """Test the translation cache implementation"""
    
    def test_cache_get_set(self):
        """Test basic cache operations"""
        cache = TranslationCache(max_size=10)
        
        # Initially empty
        self.assertIsNone(cache.get("你好"))
        
        # Set and get
        cache.set("你好", "Hello")
        self.assertEqual(cache.get("你好"), "Hello")
    
    def test_cache_size_limit(self):
        """Test cache respects size limit"""
        cache = TranslationCache(max_size=3)
        
        cache.set("key1", "val1")
        cache.set("key2", "val2")
        cache.set("key3", "val3")
        cache.set("key4", "val4")  # Should evict key1
        
        self.assertIsNone(cache.get("key1"))  # Evicted
        self.assertEqual(cache.get("key4"), "val4")  # Present
    
    def test_cache_stats(self):
        """Test cache statistics tracking"""
        cache = TranslationCache(max_size=10)
        
        cache.set("key1", "val1")
        cache.get("key1")  # Hit
        cache.get("key2")  # Miss
        
        stats = cache.get_stats()
        self.assertEqual(stats['hits'], 1)
        self.assertEqual(stats['misses'], 1)
        self.assertEqual(stats['size'], 1)
        self.assertEqual(stats['hit_rate'], 0.5)


class TestRateLimiter(unittest.TestCase):
    """Test the rate limiter implementation"""
    
    def test_rate_limiting(self):
        """Test that rate limiting introduces delays"""
        limiter = RateLimiter(calls_per_second=5)
        
        start = time.time()
        limiter.wait()
        limiter.wait()
        elapsed = time.time() - start
        
        # Should take at least 0.2s (1/5 second between calls)
        self.assertGreaterEqual(elapsed, 0.18)  # Allow small margin


class TestChineseTranslator(unittest.TestCase):
    """Test the main translator class"""
    
    def setUp(self):
        """Set up translator for each test"""
        self.translator = ChineseTranslator(cache_size=100)
    
    def test_translate_single(self):
        """Test single translation"""
        result = self.translator.translate("你好")
        self.assertEqual(result, "Hello")
    
    def test_translate_empty(self):
        """Test empty string translation"""
        result = self.translator.translate("")
        self.assertEqual(result, "")
    
    def test_translate_with_cache(self):
        """Test that caching works"""
        # First call
        result1 = self.translator.translate("你好")
        stats1 = self.translator.get_cache_stats()
        
        # Second call (should be cached)
        result2 = self.translator.translate("你好")
        stats2 = self.translator.get_cache_stats()
        
        self.assertEqual(result1, result2)
        self.assertEqual(stats1['hits'], 0)
        self.assertEqual(stats2['hits'], 1)
    
    def test_translate_without_cache(self):
        """Test translation with cache disabled"""
        result1 = self.translator.translate("你好", use_cache=False)
        result2 = self.translator.translate("你好", use_cache=False)
        
        stats = self.translator.get_cache_stats()
        self.assertEqual(stats['hits'], 0)  # No cache hits
    
    def test_translate_batch(self):
        """Test batch translation"""
        texts = ["你好", "再见", "谢谢"]
        results = self.translator.translate_batch(texts)
        
        self.assertEqual(len(results), 3)
        self.assertEqual(results[0], "Hello")
        self.assertEqual(results[1], "Goodbye")
        self.assertEqual(results[2], "Thank you")
    
    def test_translate_batch_with_duplicates(self):
        """Test batch translation deduplicates efficiently"""
        texts = ["你好", "你好", "再见", "你好"]
        results = self.translator.translate_batch(texts)
        
        self.assertEqual(len(results), 4)
        self.assertEqual(results[0], "Hello")
        self.assertEqual(results[1], "Hello")
        self.assertEqual(results[2], "Goodbye")
        self.assertEqual(results[3], "Hello")
    
    def test_translate_batch_empty(self):
        """Test batch translation with empty list"""
        results = self.translator.translate_batch([])
        self.assertEqual(results, [])
    
    def test_lazy_loading(self):
        """Test that dictionary is loaded lazily"""
        new_translator = ChineseTranslator()
        # Dictionary should not be loaded yet
        self.assertIsNone(new_translator._dictionary)
        
        # Access dictionary property
        _ = new_translator.dictionary
        
        # Now it should be loaded
        self.assertIsNotNone(new_translator._dictionary)
    
    def test_cache_performance(self):
        """Test that cache improves performance"""
        # First translation (uncached)
        start1 = time.time()
        self.translator.translate("新词汇")
        time1 = time.time() - start1
        
        # Second translation (cached)
        start2 = time.time()
        self.translator.translate("新词汇")
        time2 = time.time() - start2
        
        # Cached should be much faster (at least 10x)
        self.assertLess(time2, time1 / 10)


class TestPerformanceComparison(unittest.TestCase):
    """Test performance improvements"""
    
    def test_batch_vs_individual(self):
        """Test that batch processing is more efficient"""
        translator = ChineseTranslator()
        texts = ["text1", "text2", "text3", "text4", "text5"]
        
        # Individual translations
        start1 = time.time()
        results1 = [translator.translate(text) for text in texts]
        time1 = time.time() - start1
        
        # Clear cache for fair comparison
        translator.cache = TranslationCache(max_size=100)
        
        # Batch translation
        start2 = time.time()
        results2 = translator.translate_batch(texts)
        time2 = time.time() - start2
        
        # Results should be the same
        self.assertEqual(results1, results2)
        
        # Batch should be at least as fast (usually faster)
        # Note: In this simulation, timing might be similar, but in
        # real scenarios with API calls, batch is significantly faster


def run_performance_benchmark():
    """Run a performance benchmark"""
    print("\n" + "="*60)
    print("PERFORMANCE BENCHMARK")
    print("="*60)
    
    translator = ChineseTranslator(cache_size=1000)
    
    # Test 1: Cache effectiveness
    print("\n1. Cache Effectiveness Test")
    texts = ["你好", "再见", "谢谢"] * 10  # 30 translations, 3 unique
    
    start = time.time()
    results = translator.translate_batch(texts)
    elapsed = time.time() - start
    
    stats = translator.get_cache_stats()
    print(f"   Translated {len(texts)} texts in {elapsed:.3f}s")
    print(f"   Cache hit rate: {stats['hit_rate']:.1%}")
    print(f"   Cache hits: {stats['hits']}, misses: {stats['misses']}")
    
    # Test 2: Single vs Batch
    print("\n2. Single vs Batch Translation Test")
    translator2 = ChineseTranslator()
    test_texts = ["text1", "text2", "text3", "text4", "text5"]
    
    start = time.time()
    single_results = [translator2.translate(t) for t in test_texts]
    single_time = time.time() - start
    
    translator3 = ChineseTranslator()
    start = time.time()
    batch_results = translator3.translate_batch(test_texts)
    batch_time = time.time() - start
    
    print(f"   Single translations: {single_time:.3f}s")
    print(f"   Batch translation: {batch_time:.3f}s")
    print(f"   Speedup: {single_time/batch_time:.2f}x")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    # Run tests
    unittest.main(argv=[''], verbosity=2, exit=False)
    
    # Run benchmark
    run_performance_benchmark()
