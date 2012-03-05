import unittest

from parser import SafeHtmlParser

class SafeHtmlParserTest(unittest.TestCase):
	def setUp(self):
		self.parser = SafeHtmlParser()

	def test_simpleH1H2ShouldBePreserved(self):
		original = """<h1></h1><h2></h2>"""
		expected = original
		self._makeHtmlSafeAndCompare(original, expected)

	def test_scriptTagShouldBeRemoved(self):
		original = """<script type='text/javascript'>alert('hacked')</script>
		<h1></h1><h2></h2>
		<script src="http://www.hacker.com/xss.js"></script>
		"""
		expected = """<h1></h1><h2></h2>"""
		self._makeHtmlSafeAndCompare(original, expected)

	def test_htmlPageStructureShouldBeRemoved(self):
		original = """<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8">
					<title>page title</title>
					<link rel="stylesheet" href="/statics/css/general.css" type="text/css" media="screen" />
					<link rel="icon" type="image/png" href="/statics/favicon.png" />
				</head>
				<body>
					<p>This is a simple paragraph</p>
				</body>
			</html>"""
		expected = """<link rel="stylesheet" href="/statics/css/general.css" type="text/css" media="screen" />
				<link rel="icon" type="image/png" href="/statics/favicon.png" />
				<p>This is a simple paragraph</p>"""
		self._makeHtmlSafeAndCompare(original, expected)
	
	def test_javascriptExecutionThroughCssBackgroundUrlShouldBeRemoved(self):
		original = """<style type="type/css">
				body {
					background: url("javascript:alert('hacked)");
				}
				.main .sub p {
					background-image: url(javascript:if(window.hacker==true){hackNowr()});
				}
			</style>"""
		expected = """	<style type="type/css">
					body {
						background: """ + SafeHtmlParser.noJavaScriptInCssWarningIcon + """;
					}
					.main .sub p {
						background-image: """ + SafeHtmlParser.noJavaScriptInCssWarningIcon + """;
					}
				</style>"""
		self._makeHtmlSafeAndCompare(original, expected)
	
	def test_javascriptExecutionThroughLinkShouldBeRemoved(self):
		original = """<p>
						<a href="javascript:hackingNow(2);">The href attribute of this link should be removed</a>
					</p>"""
		expected = """<p>
						<a>The href attribute of this link should be removed</a>
					</p>"""
		self._makeHtmlSafeAndCompare(original, expected)	
	
	def test_textNodesInsideATagShouldBeKept(self):
		original = """<p>
						this is some text here that should be kept
						<a href="javascript:hackingNow(2);">The href attribute of this link should be removed</a>
						and more text here
					</p>"""
		expected = """<p>
						this is some text here that should be kept
						<a>The href attribute of this link should be removed</a>
						and more text here
					</p>"""
		self._makeHtmlSafeAndCompare(original, expected)
	
	def test_allTextNodesShouldBeKept(self):
		original = """There can be text node with no HTML tag around them
					<p>Or with HTML tags around them too <span>Test</span> 
					and some more data here with an <img src="test.jpg" />
					and some more data</p>
					Will this text node be kept?<br />
					And this one?"""
		expected = original
		self._makeHtmlSafeAndCompare(original, expected)
	
	def _makeHtmlSafeAndCompare(self, original, expected):
		safe = self.parser.getSafeHtml(original)
		
		safe = self._cleanStringForEasyComparison(safe)
		expected = self._cleanStringForEasyComparison(expected)
		
		self.assertEqual(safe, expected, "\nEXPECTED:\n" + expected + "\nFOUND:\n" + safe)
	
	def _cleanStringForEasyComparison(self, str):
		lines = str.strip().replace("\t", "").splitlines()
		return "".join(lines)

if __name__ == '__main__':
	unittest.main()