const AuthImagePattern = ({ title, subtitle }) => {
    return (
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-12 w-1/2">
        <div className="max-w-md text-center">
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl bg-purple-500/10 ${
                  i % 2 === 0 ? "animate-pulse" : ""
                }`}
              />
            ))}
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>
      </div>
    );
  };
  
  export default AuthImagePattern;