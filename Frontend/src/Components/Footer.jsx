const Footer = () => {
    return (
      <footer className="mt- pt-10 bg-black text-white pb-10">
        <hr className="border-t border-purple-600 mx-20" />
        <div className="text-center mt-8 space-y-4">
          <div className="flex justify-center gap-6 text-sm text-gray-300">
            <a href="#" className="hover:text-purple-400 transition">Conditions of Use</a>
            <h1><b>|</b></h1>
            <a href="#" className="hover:text-purple-400 transition">Privacy Notice</a>
          </div>
          <p className="text-gray-400 text-sm">
            portfolio-nilesh-47.vercel.app
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  