"""
Example: Inefficient translation code (BEFORE optimization)

This file demonstrates common performance anti-patterns that should be avoided.
See examples_efficient.py for the optimized versions.
"""

import time


class SlowTranslator:
    """Example of an inefficient translator implementation"""
    
    def __init__(self):
        # PROBLEM 1: Eager loading - loads everything at startup
        print("Loading large dictionary...")
        self.dictionary = self._load_large_dictionary()
        print("Dictionary loaded!")
    
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
        PROBLEM 2: No caching - makes API call every time
        even for repeated translations
        """
        if text in self.dictionary:
            return self.dictionary[text]
        return self._call_api(text)
    
    def translate_list(self, texts):
        """
        PROBLEM 3: No batch processing - makes individual API calls
        PROBLEM 4: No rate limiting - can overwhelm API
        """
        results = []
        for text in texts:
            result = self.translate(text)
            results.append(result)
        return results


class InefficientDataProcessing:
    """Example of inefficient data structure usage"""
    
    def __init__(self):
        # PROBLEM 5: Using list of tuples instead of dictionary
        self.translations = [
            ('你好', 'Hello'),
            ('再见', 'Goodbye'),
            ('谢谢', 'Thank you'),
            ('对不起', 'Sorry'),
            ('是', 'Yes'),
            ('不是', 'No'),
        ]
    
    def find_translation(self, text):
        """
        PROBLEM 6: O(n) search instead of O(1) dictionary lookup
        """
        for chinese, english in self.translations:
            if chinese == text:
                return english
        return None


def inefficient_batch_processing(translator, texts):
    """
    PROBLEM 7: Creating new connections/resources for each item
    """
    results = []
    for text in texts:
        # Simulating creating a new "connection" each time
        connection = create_connection()
        result = translator.translate(text)
        results.append(result)
        connection.close()
    return results


def create_connection():
    """Simulates creating a connection"""
    time.sleep(0.01)
    return type('Connection', (), {'close': lambda self: None})()


def nested_loop_inefficiency():
    """
    PROBLEM 8: Nested loops with repeated work
    """
    chinese_texts = ['你好', '再见', '谢谢'] * 100
    english_texts = ['Hello', 'Goodbye', 'Thank you'] * 100
    
    matches = []
    # O(n²) complexity - very slow for large lists
    for c_text in chinese_texts:
        for e_text in english_texts:
            if translate_manually(c_text) == e_text:
                matches.append((c_text, e_text))
    return matches


def translate_manually(text):
    """Simulates manual translation"""
    mapping = {'你好': 'Hello', '再见': 'Goodbye', '谢谢': 'Thank you'}
    return mapping.get(text, text)


def no_memory_management():
    """
    PROBLEM 9: Unbounded cache - memory leak risk
    """
    cache = {}  # No size limit!
    
    for i in range(1000000):
        key = f"text_{i}"
        cache[key] = f"translation_{i}"
        # Cache grows indefinitely - will eventually run out of memory
    
    return cache


def redundant_api_calls():
    """
    PROBLEM 10: No deduplication - translates same text multiple times
    """
    translator = SlowTranslator()
    texts = ['你好', '你好', '你好', '再见', '再见']  # Many duplicates
    
    # Translates '你好' three times instead of once
    results = []
    for text in texts:
        result = translator.translate(text)
        results.append(result)
    
    return results


# Demonstration of performance impact
if __name__ == "__main__":
    print("=== INEFFICIENT CODE EXAMPLES ===\n")
    
    # Problem 1: Slow initialization
    print("1. Slow initialization (eager loading):")
    start = time.time()
    translator = SlowTranslator()
    print(f"   Time: {time.time() - start:.2f}s\n")
    
    # Problem 2 & 3: No caching, no batch processing
    print("2. No caching - repeated translations:")
    texts = ['你好', '你好', '你好', '再见', '再见']
    start = time.time()
    results = translator.translate_list(texts)
    print(f"   Time: {time.time() - start:.2f}s")
    print(f"   Results: {results}\n")
    
    # Problem 5 & 6: Inefficient data structure
    print("3. O(n) search instead of O(1) lookup:")
    processor = InefficientDataProcessing()
    start = time.time()
    for _ in range(1000):
        processor.find_translation('是')
    print(f"   Time for 1000 lookups: {time.time() - start:.2f}s\n")
    
    # Problem 8: Nested loops
    print("4. Nested loops with O(n²) complexity:")
    start = time.time()
    matches = nested_loop_inefficiency()
    print(f"   Time: {time.time() - start:.2f}s")
    print(f"   Matches found: {len(matches)}\n")
    
    print("See examples_efficient.py for optimized versions!")
