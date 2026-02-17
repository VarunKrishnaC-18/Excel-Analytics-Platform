import { User, Shield, Trash2, Database, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const Settings = ({ user, onClearData, onResetHistory }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-foreground">Settings</h2>
                <p className="text-muted-foreground">Manage your account and application data</p>
            </div>

            {/* Profile Section */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">{user?.name}</h3>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            Pro Account
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg bg-background/50">
                        <div className="flex items-center space-x-2 mb-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">Privacy & Security</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Your data is processed locally and never stored on our servers.</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg bg-background/50">
                        <div className="flex items-center space-x-2 mb-2">
                            <Database className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">Data Management</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Control how your uploaded files and analytics are stored locally.</p>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-8">
                <div className="flex items-center space-x-2 mb-6">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-foreground">Reset File History</h4>
                            <p className="text-sm text-muted-foreground">Clear all your uploaded files and recent activity logs.</p>
                        </div>
                        <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={onResetHistory}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Reset History
                        </Button>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-destructive/10">
                        <div>
                            <h4 className="font-medium text-foreground">Clear All Account Data</h4>
                            <p className="text-sm text-muted-foreground">Permanently delete your profile and all local application data.</p>
                        </div>
                        <Button variant="destructive" onClick={onClearData}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account Data
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
