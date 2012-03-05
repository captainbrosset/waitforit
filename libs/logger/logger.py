import logging

def prepareLogMessage(instance, message):
    return "[" + instance.__class__.__name__ + "] " + str(message)

def debug(instance, message):
    logging.debug(prepareLogMessage(instance, message))

def info(instance, message):
    logging.info(prepareLogMessage(instance, message))
    
def warning(instance, message):
    logging.warning(prepareLogMessage(instance, message))    

def error(instance, message):
    logging.error(prepareLogMessage(instance, message))