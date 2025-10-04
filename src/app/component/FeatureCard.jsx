export const FeatureCard = ({ icon, title, description, delay }) => (
    <div className="glass-card rounded-2xl p-8 reveal" style={{ transitionDelay: delay }}>
        <div className="bg-blue-500/10 text-blue-400 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
    </div>
);