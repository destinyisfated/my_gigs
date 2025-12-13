// src/pages/FreelancerProfileEdit.tsx
import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Briefcase,
  Award,
  MapPin,
  X,
  Plus,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LocationSelect } from "@/components/LocationSelect";
import { useAuth } from "@clerk/clerk-react";

interface Profession {
  id: number;
  name: string;
  image_url?: string;
  description?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const FreelancerProfileEdit = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // basic loading / error
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // professions
  const [professions, setProfessions] = useState<Profession[]>([]);

  // form state (controlled)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState(""); // new model field
  const [tagline, setTagline] = useState(""); // new model field
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedProfessionId, setSelectedProfessionId] = useState<number | null>(null);

  // location fields (model uses county (string), county_code (int), constituency, ward)
  const [county, setCounty] = useState("");
  const [countyCode, setCountyCode] = useState<number | null>(null);
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");

  // professional details
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [yearsExperience, setYearsExperience] = useState<number | "">("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [availability, setAvailability] = useState<string>("available");

  // Helper: fetch clerk token for auth header
  const getAuthToken = useCallback(async () => {
    try {
      const t = await getToken({ template: "default" });
      return t;
    } catch (err) {
      console.error("Failed to get Clerk token", err);
      return null;
    }
  }, [getToken]);

  // Load professions + profile on mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // parallel fetch professions and profile
        const token = await getAuthToken();
        console.log("🔥 Clerk Token:", token);

        const [profRes, profileRes] = await Promise.all([
          fetch(`${API_BASE}/professions/`),
          fetch(`${API_BASE}/freelancers/me/`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ]);

        if (!profRes.ok) throw new Error("Failed to load professions");
        const profJson = await profRes.json();

        if (!profileRes.ok) {
          // If no profile yet, backend might return 404 — handle gracefully
          if (profileRes.status === 404) {
            // leave form defaults blank
          } else {
            const text = await profileRes.text();
            throw new Error(`Failed to load profile: ${profileRes.status} ${text}`);
          }
        } else {
          const profileJson = await profileRes.json();

          // Populate form fields from backend (match your model)
          // name -> split into first + last (you chose option A)
          const fullName: string = profileJson.name || "";
          const parts = fullName.trim().split(" ");
          setFirstName(parts[0] ?? "");
          setLastName(parts.slice(1).join(" ") ?? "");

          setTitle(profileJson.title ?? "");
          setTagline(profileJson.tagline ?? "");
          setBio(profileJson.bio ?? "");
          setEmail(profileJson.email ?? "");
          setPhone(profileJson.phone ?? "");
          setCounty(profileJson.county ?? "");
          setCountyCode(profileJson.county_code ?? null);
          setConstituency(profileJson.constituency ?? "");
          setWard(profileJson.ward ?? "");
          setHourlyRate(profileJson.hourly_rate ?? "");
          setYearsExperience(profileJson.years_experience ?? "");
          setSkills(Array.isArray(profileJson.skills) ? profileJson.skills : []);
          setAvailability(profileJson.availability ?? "available");
          setSelectedProfessionId(profileJson.profession ?? null);
        }

        // set professions list
        // profJson could be array or paginated; handle both
        const profs = Array.isArray(profJson) ? profJson : profJson.results ?? [];
        if (mounted) setProfessions(profs);
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [getAuthToken]);

  // skills helpers
  const addSkill = () => {
    const s = currentSkill.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills((p) => [...p, s]);
    setCurrentSkill("");
  };
  const removeSkill = (skillToRemove: string) => {
    setSkills((p) => p.filter((s) => s !== skillToRemove));
  };

  // LocationSelect handlers — assume it calls (id, name)
  const handleCountyChange = (id: string, name: string) => {
    setCounty(name);
    const parsed = Number(id);
    setCountyCode(Number.isNaN(parsed) ? null : parsed);
    setConstituency("");
    setWard("");
  };
  const handleConstituencyChange = (id: string, name: string) => {
    setConstituency(name);
    setWard("");
  };
  const handleWardChange = (id: string, name: string) => {
    setWard(name);
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // merge first + last into name
    const name = `${firstName}`.trim() + (lastName ? ` ${lastName.trim()}` : "");

    // Build payload aligned with your model
   const payload: any = {
  // nested user info
      user_first_name: firstName.trim(),
      user_last_name: lastName.trim(),
      user_email: email.trim(),

      // freelancer profile fields
      name: `${firstName.trim()} ${lastName.trim()}`,
      title,
      tagline,
      bio,
      phone,
      county,
      county_code: countyCode,
      constituency,
      ward,
      hourly_rate: hourlyRate === "" ? 0 : Number(hourlyRate),
      years_experience: yearsExperience === "" ? 0 : Number(yearsExperience),
      skills,
      availability,
      profession: selectedProfessionId,
    };

    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/freelancers/me/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Save failed", res.status, errBody);
        toast({
          title: "Failed to update profile",
          description:
            (errBody && errBody.detail) ||
            "Please check the fields and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Updated!",
        description: "Your freelancer profile has been successfully updated.",
      });

      navigate("/dashboard/freelancer");
    } catch (err) {
      console.error(err);
      toast({
        title: "Network Error",
        description: "Failed to reach the server. Try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // simple loading / error UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading…</div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Edit Your Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Keep your profile updated to attract more clients and
                opportunities
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                </TabsList>

                {/* Personal */}
                <TabsContent value="personal" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Your basic information visible to clients
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                          {(firstName[0] || "") + (lastName[0] || "")}
                        </div>
                        <div className="space-y-2">
                          <Button type="button" variant="outline" size="sm">
                            Upload Photo
                          </Button>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            JPG, PNG or GIF. Max size 2MB
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Full Stack Web Developer"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          placeholder="A brief catchy description"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio *</Label>
                        <Textarea
                          id="bio"
                          rows={5}
                          placeholder="Tell clients about yourself..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          required
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum 100 characters recommended
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+254 712 345 678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Location
                      </CardTitle>
                      <CardDescription>
                        Select your location from our database
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <LocationSelect
                        selectedCounty={countyCode ? String(countyCode) : ""}
                        selectedConstituency={constituency}
                        selectedWard={ward}
                        onCountyChange={(id, name) => handleCountyChange(id, name)}
                        onConstituencyChange={(id, name) => handleConstituencyChange(id, name)}
                        onWardChange={(id, name) => handleWardChange(id, name)}
                        required
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Professional */}
                <TabsContent value="professional" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Professional Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={selectedProfessionId ? String(selectedProfessionId) : ""}
                            onValueChange={(val) => setSelectedProfessionId(val ? Number(val) : null)}
                            required
                          >
                            <SelectTrigger id="category" className="h-11">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              {professions.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            placeholder="35"
                            value={hourlyRate as any}
                            onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Select
                            value={yearsExperience !== "" ? String(yearsExperience) : ""}
                            onValueChange={(val) => setYearsExperience(val ? Number(val) : "")}
                          >
                            <SelectTrigger id="experience" className="h-11">
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="0">Less than 1 year</SelectItem>
                              <SelectItem value="1">1 year</SelectItem>
                              <SelectItem value="3">3 years</SelectItem>
                              <SelectItem value="5">5 years</SelectItem>
                              <SelectItem value="10">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="availability">Availability</Label>
                          <Select
                            value={availability}
                            onValueChange={(val) => setAvailability(val)}
                          >
                            <SelectTrigger id="availability" className="h-11">
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="busy">Busy</SelectItem>
                              <SelectItem value="unavailable">Unavailable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Skills & Expertise
                      </CardTitle>
                      <CardDescription>Add skills that match your expertise</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="skills">Add Skills</Label>
                        <div className="flex gap-2">
                          <Input
                            id="skills"
                            placeholder="Type a skill and press Enter or +"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                            className="h-11"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addSkill}
                            className="h-11 w-11"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {skills.length > 0 && (
                        <div>
                          <Label className="mb-3 block">Your Skills</Label>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="px-3 py-2 text-sm flex items-center gap-2">
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-2 hover:text-destructive"
                                  aria-label={`Remove ${skill}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Portfolio */}
                <TabsContent value="portfolio" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio & Work Samples</CardTitle>
                      <CardDescription>
                        Showcase your best work (coming soon)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        Portfolio upload feature will be available soon
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 justify-end pt-6 sticky bottom-4 bg-background/80 backdrop-blur-sm border-t p-4 rounded-lg">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/dashboard/freelancer")}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="hero" size="lg" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerProfileEdit;
