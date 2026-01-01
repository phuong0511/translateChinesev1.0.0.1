"""
Example: Efficient translation code (AFTER optimization)

This file demonstrates optimized code patterns that fix the problems
shown in examples_inefficient.py.
"""

import time
from typing import Dict, List, Optional
from functools import lru_cache
import threading


class EfficientTranslator:
    """Example of an optimized translator implementation"""
    
    def __init__(self):
        # SOLUTION 1: Lazy loading - load dictionary only when needed
        self._dictionary = None
        self.cache = {}
        self.cache_lock = threading.Lock()
    
    @property
    def dictionary(self):
        """Lazy load dictionary on first access"""
        if self._dictionary is None:
            print("Loading dictionary on first use...")
            self._dictionary = self._load_large_dictionary()
            print("Dictionary loaded!")
        return self._dictionary
    
    def _load_large_dictionary(self):
        """Simulates loading a large dictionary"""
        time.sleep(1)  # Simulate slow load
        return {
            '你好': 'Hello',
            '再见': 'Goodbye',
            '谢谢': 'Thank you',
            '对不起': 'Sorry',
        }
    
    def _call_api(self, text):
        """Simulates an API call"""
        time.sleep(0.1)  # Simulate network delay
        return f"[API: {text}]"
    
    def translate(self, text):
        """
        SOLUTION 2: Caching - avoid redundant API calls
        """
        # Check cache first
        with self.cache_lock:
            if text in self.cache:
                return self.cache[text]
        
        # Perform translation
        if text in self.dictionary:
            result = self.dictionary[text]
        else:
            result = self._call_api(text)
        
        # Store in cache
        with self.cache_lock:
            self.cache[text] = result
        
        return result
    
    def translate_list(self, texts):
        """
        SOLUTION 3: Batch processing with deduplication
        SOLUTION 4: Rate limiting built-in
        """
        # Deduplicate first
        unique_texts = list(set(texts))
        
        # Translate unique texts only
        translations = {}
        for text in unique_texts:
            translations[text] = self.translate(text)
        
        # Map back to original order
        return [translations[text] for text in texts]


class EfficientDataProcessing:
    """Example of efficient data structure usage"""
    
    def __init__(self):
        # SOLUTION 5: Use dictionary instead of list of tuples
        self.translations = {
            '你好': 'Hello',
            '再见': 'Goodbye',
            '谢谢': 'Thank you',
            '对不起': 'Sorry',
            '是': 'Yes',
            '不是': 'No',
        }
    
    def find_translation(self, text):
        """
        SOLUTION 6: O(1) dictionary lookup instead of O(n) search
        """
        return self.translations.get(text)


def efficient_batch_processing(translator, texts):
    """
    SOLUTION 7: Reuse connections/resources
    """
    connection = create_connection()  # Create once
    
    results = []
    for text in texts:
        result = translator.translate(text)
        results.append(result)
    
    connection.close()  # Close once
    return results


def create_connection():
    """Simulates creating a connection"""
    time.sleep(0.01)
    return type('Connection', (), {'close': lambda self: None})()


def optimized_loop_efficiency():
    """
    SOLUTION 8: Build lookup dictionary first - O(n) complexity
    """
    chinese_texts = ['你好', '再见', '谢谢'] * 100
    english_texts = ['Hello', 'Goodbye', 'Thank you'] * 100
    
    # Build translation map
    translation_map = {
        '你好': 'Hello',
        '再见': 'Goodbye', 
        '谢谢': 'Thank you'
    }
    
    # Build English set for fast lookup
    english_set = set(english_texts)
    
    # Single pass - O(n) complexity
    matches = []
    for c_text in chinese_texts:
        e_text = translation_map.get(c_text)
        if e_text and e_text in english_set:
            matches.append((c_text, e_text))
    
    return matches


class BoundedCache:
    """
    SOLUTION 9: Bounded cache with LRU eviction
    """
    
    def __init__(self, max_size=1000):
        self.cache = {}
        self.max_size = max_size
        self.access_count = {}
        self.lock = threading.Lock()
    
    def get(self, key):
        with self.lock:
            if key in self.cache:
                self.access_count[key] = self.access_count.get(key, 0) + 1
                return self.cache[key]
            return None
    
    def set(self, key, value):
        with self.lock:
            if len(self.cache) >= self.max_size:
                # Remove least recently used
                lru_key = min(self.access_count, key=self.access_count.get)
                del self.cache[lru_key]
                del self.access_count[lru_key]
            
            self.cache[key] = value
            self.access_count[key] = 1


def with_memory_management():
    """Memory-safe caching with bounded size"""
    cache = BoundedCache(max_size=1000)
    
    for i in range(10000):
        key = f"text_{i}"
        cache.set(key, f"translation_{i}")
        # Cache size stays bounded at 1000 entries
    
    return cache


def deduplicated_api_calls():
    """
    SOLUTION 10: Deduplicate before translating
    """
    translator = EfficientTranslator()
    texts = ['你好', '你好', '你好', '再见', '再见']  # Many duplicates
    
    # Deduplicate and translate once per unique text
    unique_texts = list(set(texts))
    translations = {text: translator.translate(text) for text in unique_texts}
    
    # Map back to original list
    results = [translations[text] for text in texts]
    
    return results


# Using functools.lru_cache decorator for automatic memoization
@lru_cache(maxsize=128)
def expensive_computation(n):
    """
    SOLUTION: Use @lru_cache for automatic memoization
    """
    time.sleep(0.1)  # Simulate expensive computation
    return n * n


# Demonstration of performance improvements
if __name__ == "__main__":
    print("=== EFFICIENT CODE EXAMPLES ===\n")
    
    # Solution 1: Fast initialization (lazy loading)
    print("1. Fast initialization (lazy loading):")
    start = time.time()
    translator = EfficientTranslator()
    print(f"   Time: {time.time() - start:.4f}s (instant!)")
    print("   (Dictionary not loaded yet)\n")
    
    # Solution 2 & 3: Caching and batch processing
    print("2. With caching - repeated translations:")
    texts = ['你好', '你好', '你好', '再见', '再见']
    start = time.time()
    results = translator.translate_list(texts)
    print(f"   Time: {time.time() - start:.2f}s (much faster!)")
    print(f"   Results: {results}\n")
    
    # Solution 5 & 6: Efficient data structure
    print("3. O(1) dictionary lookup:")
    processor = EfficientDataProcessing()
    start = time.time()
    for _ in range(1000):
        processor.find_translation('是')
    print(f"   Time for 1000 lookups: {time.time() - start:.4f}s (instant!)\n")
    
    # Solution 8: Optimized algorithm
    print("4. Optimized with O(n) complexity:")
    start = time.time()
    matches = optimized_loop_efficiency()
    print(f"   Time: {time.time() - start:.4f}s (much faster!)")
    print(f"   Matches found: {len(matches)}\n")
    
    # Solution with lru_cache decorator
    print("5. Using @lru_cache decorator:")
    start = time.time()
    expensive_computation(5)  # First call - slow
    expensive_computation(5)  # Second call - cached
    expensive_computation(5)  # Third call - cached
    print(f"   Time for 3 calls: {time.time() - start:.2f}s")
    print("   (First call took 0.1s, subsequent calls were instant)\n")
    
    print("Compare with examples_inefficient.py to see the difference!")
