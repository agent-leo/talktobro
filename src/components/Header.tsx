import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, AlertTriangle, UserCheck } from 'lucide-react';
import talktobroLogo from '@/assets/talktobro-logo.png';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LinkAccountDialog } from '@/components/LinkAccountDialog';

export function Header() {
  const { user, isAnonymous, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="px-6 py-4 border-b border-border/50">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={talktobroLogo} 
            alt="TalkToBro" 
            className="h-8"
          />
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {isAnonymous ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">Guest</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <UserCheck className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                      {user.email || user.phone || 'Account'}
                    </span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAnonymous && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">
                      Guest account — data may be lost
                    </p>
                  </div>
                  <LinkAccountDialog 
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Link Account
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => navigate('/ledger')}>
                <User className="w-4 h-4 mr-2" />
                Decision Ledger
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}