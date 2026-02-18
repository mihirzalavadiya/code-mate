const adminAuth = (req, res, next) => {
  const token = 'xyz';
  const isAdminAuthenticated = token === 'xyz'; // Simulate authentication check
  if (isAdminAuthenticated) {
    next();
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
};

const userAuth = (req, res, next) => {
  const token = 'abc';
  const isUserAuthenticated = token === 'abc'; // Simulate authentication check
  if (isUserAuthenticated) {
    next();
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
