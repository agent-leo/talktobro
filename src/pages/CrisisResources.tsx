import { Link } from 'react-router-dom';
import { Phone, Globe, MessageCircle } from 'lucide-react';
import { Header } from '@/components/Header';

interface Resource {
  name: string;
  description: string;
  phone?: string;
  website?: string;
  text?: string;
  country?: string;
}

const mentalHealthResources: Resource[] = [
  {
    name: 'National Suicide Prevention Lifeline',
    description: '24/7 crisis support for anyone in emotional distress.',
    phone: '988',
    website: 'https://988lifeline.org',
    country: 'USA',
  },
  {
    name: 'Crisis Text Line',
    description: 'Text-based crisis support available 24/7.',
    text: 'Text HOME to 741741',
    website: 'https://www.crisistextline.org',
    country: 'USA',
  },
  {
    name: 'Samaritans',
    description: '24/7 emotional support for anyone struggling to cope.',
    phone: '116 123',
    website: 'https://www.samaritans.org',
    country: 'UK',
  },
  {
    name: 'Beyond Blue',
    description: 'Mental health support and resources.',
    phone: '1300 22 4636',
    website: 'https://www.beyondblue.org.au',
    country: 'Australia',
  },
  {
    name: 'International Association for Suicide Prevention',
    description: 'Directory of crisis centers worldwide.',
    website: 'https://www.iasp.info/resources/Crisis_Centres/',
    country: 'International',
  },
];

const gamblingAddictionResources: Resource[] = [
  {
    name: 'National Council on Problem Gambling',
    description: 'Confidential help for gambling problems, including trading addiction.',
    phone: '1-800-522-4700',
    website: 'https://www.ncpgambling.org',
    text: 'Text 1-800-522-4700',
    country: 'USA',
  },
  {
    name: 'Gamblers Anonymous',
    description: 'Fellowship of people who share experience, strength, and hope.',
    website: 'https://www.gamblersanonymous.org',
    country: 'International',
  },
  {
    name: 'GamCare',
    description: 'Support, information, and counseling for gambling problems.',
    phone: '0808 8020 133',
    website: 'https://www.gamcare.org.uk',
    country: 'UK',
  },
  {
    name: 'Gambling Help Online',
    description: 'Free counseling and support services.',
    phone: '1800 858 858',
    website: 'https://www.gamblinghelponline.org.au',
    country: 'Australia',
  },
];

const financialStressResources: Resource[] = [
  {
    name: 'National Foundation for Credit Counseling',
    description: 'Non-profit financial counseling and debt management.',
    phone: '1-800-388-2227',
    website: 'https://www.nfcc.org',
    country: 'USA',
  },
  {
    name: 'StepChange',
    description: 'Free debt advice and solutions.',
    phone: '0800 138 1111',
    website: 'https://www.stepchange.org',
    country: 'UK',
  },
  {
    name: 'Financial Counselling Australia',
    description: 'Free and confidential financial counseling.',
    phone: '1800 007 007',
    website: 'https://www.financialcounsellingaustralia.org.au',
    country: 'Australia',
  },
];

const ResourceCard = ({ resource }: { resource: Resource }) => (
  <div className="py-5 border-b border-border/50 last:border-b-0">
    <div className="flex items-start justify-between gap-4 mb-2">
      <h4 className="font-medium text-foreground">{resource.name}</h4>
      {resource.country && (
        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded shrink-0">
          {resource.country}
        </span>
      )}
    </div>
    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
    <div className="flex flex-wrap gap-4 text-sm">
      {resource.phone && (
        <a 
          href={`tel:${resource.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-1.5 text-foreground hover:text-accent transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          {resource.phone}
        </a>
      )}
      {resource.text && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="w-3.5 h-3.5" />
          {resource.text}
        </span>
      )}
      {resource.website && (
        <a 
          href={resource.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-foreground hover:text-accent transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          Website
        </a>
      )}
    </div>
  </div>
);

const CrisisResources = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Support & Safety
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            TalkToBro is coaching and execution support — not medical care.
            If you are in crisis, use these professional services now.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-secondary/30 border border-border rounded-lg p-6 mb-12">
          <p className="text-foreground font-medium mb-2">
            If there is immediate risk, call emergency services now.
          </p>
          <p className="text-sm text-muted-foreground">
            This page is here to get you to qualified help quickly.
            Your safety comes before any business, trade, or task.
          </p>
        </div>

        {/* Mental Health Section */}
        <section className="mb-12">
          <h3 className="font-serif text-xl text-foreground mb-2">Immediate emotional support</h3>
          <p className="text-sm text-muted-foreground mb-6">
            24/7 crisis lines and emotional support services.
          </p>
          <div className="border-t border-border">
            {mentalHealthResources.map((resource) => (
              <ResourceCard key={resource.name} resource={resource} />
            ))}
          </div>
        </section>

        {/* Gambling/Trading Addiction Section */}
        <section className="mb-12">
          <h3 className="font-serif text-xl text-foreground mb-2">Compulsive trading or gambling support</h3>
          <p className="text-sm text-muted-foreground mb-6">
            If trading feels compulsive or out of control, these services can help.
          </p>
          <div className="border-t border-border">
            {gamblingAddictionResources.map((resource) => (
              <ResourceCard key={resource.name} resource={resource} />
            ))}
          </div>
        </section>

        {/* Financial Stress Section */}
        <section className="mb-12">
          <h3 className="font-serif text-xl text-foreground mb-2">Financial stress and debt support</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Free, non-judgmental help for money pressure and debt.
          </p>
          <div className="border-t border-border">
            {financialStressResources.map((resource) => (
              <ResourceCard key={resource.name} resource={resource} />
            ))}
          </div>
        </section>

        {/* Closing Note */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Getting help early is a power move. You are not alone, and support is available right now.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 TalkToBro</p>
          <p>Your safety matters more than any task.</p>
        </div>
      </footer>
    </div>
  );
};

export default CrisisResources;