import os

# Run the unit-tests first
print "\nRUNNING UNIT TESTS\n----------------------------------------------------------------------"

def getAllTestFiles(dirname="..", recursive=True):
	tests = []
	files = os.listdir(dirname)
	for f in files:
		filename = os.path.join(dirname, f)
		if os.path.isfile(filename):
			if f.endswith("_test.py"):
				tests.append(filename)
		if os.path.isdir(filename):
			if recursive:
				tests = tests + getAllTestFiles(dirname=filename)
	return tests

testCases = getAllTestFiles()
for testCase in testCases:
	print "\nRUNNING TESTCASE " + testCase + "\n----------------------------------------------------------------------"
	os.system("python " + testCase)