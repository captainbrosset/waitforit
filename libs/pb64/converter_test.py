import unittest

from converter import encodeB64Padless, decodeB64Padless

class PB64ConverterTest(unittest.TestCase):
	def test_equalCharactersAreRemoved(self):
		nb = 3
		b64 = encodeB64Padless(nb)
		self.assertTrue(b64.find("=") == -1)
		
	def test_backAndForth(self):
		nb = 23456
		b64 = encodeB64Padless(nb)
		nb2 = decodeB64Padless(b64)
		self.assertEqual(nb, nb2)
		
		nb = 0
		b64 = encodeB64Padless(nb)
		nb2 = decodeB64Padless(b64)
		self.assertEqual(nb, nb2)
		
		nb = 12452512512412465125125124
		b64 = encodeB64Padless(nb)
		nb2 = decodeB64Padless(b64)
		self.assertEqual(nb, nb2)
		
		nb = 1234
		b64 = encodeB64Padless(nb)
		nb2 = decodeB64Padless(b64)
		self.assertEqual(nb, nb2)
	
	def test_invalidPB64ShouldFail(self):
		b64 = 'EK230K--"()'
		nb = decodeB64Padless(b64)
		self.assertEqual(nb, None)
		
		b64 = 'azod!'
		nb = decodeB64Padless(b64)
		self.assertEqual(nb, None)
		
		b64 = 'azijhfaz=='
		nb = decodeB64Padless(b64)
		self.assertEqual(nb, None)

if __name__ == '__main__':
	unittest.main()