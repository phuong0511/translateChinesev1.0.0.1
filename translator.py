#!/usr/bin/env python3
"""
Efficient Chinese Translation Module

This module provides optimized translation functionality with:
- LRU caching to avoid redundant translations
- Batch processing for multiple texts
- Rate limiting to prevent API overload
- Lazy loading of resources
"""

from functools import lru_cache
from typing import List, Dict, Optional
import time
import threading


class TranslationCache:
    """Thread-safe cache for translations with size limit"""
    
    def __init__(self, max_size: int = 10000):
        self.cache: Dict[str, str] = {}
        self.max_size = max_size
        self.lock = threading.Lock()
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[str]:
        """Get cached translation"""
        with self.lock:
            if key in self.cache:
                self.hits += 1
                return self.cache[key]
            self.misses += 1
            return None
    
    def set(self, key: str, value: str) -> None:
        """Set cached translation with size management"""
        with self.lock:
            if len(self.cache) >= self.max_size:
                # Remove oldest entry using insertion order (Python 3.7+ dicts maintain insertion order)
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]
            self.cache[key] = value
    
    def get_stats(self) -> Dict[str, int]:
        """Get cache statistics"""
        return {
            'hits': self.hits,
            'misses': self.misses,
            'size': len(self.cache),
            'hit_rate': self.hits / (self.hits + self.misses) if (self.hits + self.misses) > 0 else 0
        }


class ChineseTranslator:
    """Optimized Chinese translation engine"""
    
    def __init__(self, api_key: Optional[str] = None, cache_size: int = 10000):
        self.api_key = api_key
        self.cache = TranslationCache(max_size=cache_size)
        self.rate_limiter = RateLimiter(calls_per_second=10)
        # Lazy load dictionary only when needed
        self._dictionary = None
    
    @property
    def dictionary(self) -> Dict[str, str]:
        """Lazy load translation dictionary"""
        if self._dictionary is None:
            self._dictionary = self._load_dictionary()
        return self._dictionary
    
    def _load_dictionary(self) -> Dict[str, str]:
        """Load translation dictionary (simulated)"""
        # In production, this would load from a file or database
        return {
            '你好': 'Hello',
            '再见': 'Goodbye',
            '谢谢': 'Thank you',
            '对不起': 'Sorry',
            '是': 'Yes',
            '不是': 'No',
        }
    
    def translate(self, text: str, use_cache: bool = True) -> str:
        """
        Translate Chinese text to English
        
        Args:
            text: Chinese text to translate
            use_cache: Whether to use caching (default: True)
        
        Returns:
            Translated text
        """
        if not text:
            return ""
        
        # Check cache first
        if use_cache:
            cached = self.cache.get(text)
            if cached is not None:
                return cached
        
        # Apply rate limiting
        self.rate_limiter.wait()
        
        # Perform translation (simulated API call)
        result = self._translate_internal(text)
        
        # Store in cache
        if use_cache:
            self.cache.set(text, result)
        
        return result
    
    def _translate_internal(self, text: str) -> str:
        """Internal translation logic"""
        # First try dictionary lookup (fast) - cache reference to avoid multiple property accesses
        dictionary = self.dictionary
        if text in dictionary:
            return dictionary[text]
        
        # Simulate API call for complex translations
        # In production, this would call a real translation API
        time.sleep(0.01)  # Simulate network delay
        return f"[Translated: {text}]"
    
    def translate_batch(self, texts: List[str], batch_size: int = 100) -> List[str]:
        """
        Efficiently translate multiple texts in batches
        
        Args:
            texts: List of Chinese texts to translate
            batch_size: Number of texts to process at once
        
        Returns:
            List of translated texts
        """
        results = []
        
        # Process in batches to optimize API calls
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # Filter out cached items
            uncached = []
            batch_results = [None] * len(batch)
            
            for idx, text in enumerate(batch):
                cached = self.cache.get(text)
                if cached is not None:
                    batch_results[idx] = cached
                else:
                    uncached.append((idx, text))
            
            # Translate only uncached items
            if uncached:
                self.rate_limiter.wait()
                for idx, text in uncached:
                    translated = self._translate_internal(text)
                    batch_results[idx] = translated
                    self.cache.set(text, translated)
            
            results.extend(batch_results)
        
        return results
    
    def get_cache_stats(self) -> Dict[str, int]:
        """Get cache performance statistics"""
        return self.cache.get_stats()


class RateLimiter:
    """Simple rate limiter to prevent API overload"""
    
    def __init__(self, calls_per_second: float = 10):
        self.min_interval = 1.0 / calls_per_second
        self.last_call = 0.0
        self.lock = threading.Lock()
    
    def wait(self) -> None:
        """Wait if necessary to respect rate limit"""
        with self.lock:
            now = time.time()
            time_since_last = now - self.last_call
            if time_since_last < self.min_interval:
                time.sleep(self.min_interval - time_since_last)
            self.last_call = time.time()


# Example usage demonstrating efficient patterns
if __name__ == "__main__":
    # Initialize translator with caching
    translator = ChineseTranslator(cache_size=1000)
    
    # Single translation
    result = translator.translate("你好")
    print(f"Translation: {result}")
    
    # Batch translation (efficient)
    texts = ["你好", "再见", "谢谢", "你好", "对不起"]
    results = translator.translate_batch(texts)
    print(f"Batch results: {results}")
    
    # Check cache performance
    stats = translator.get_cache_stats()
    print(f"Cache stats: {stats}")
