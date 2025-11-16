-- Seed data for daily questions (50 starter questions)
-- Categories: communication, intimacy, future, past, fun, deep, gratitude, dreams

INSERT INTO daily_questions (question_text, category, difficulty_level) VALUES
-- Communication (Level 1-2)
('What made you smile today?', 'communication', 1),
('What is one thing I did this week that made you feel loved?', 'communication', 1),
('What is your favorite way for us to spend quality time together?', 'communication', 1),
('What is something new you learned about me recently?', 'communication', 2),
('How do you prefer to receive an apology from me?', 'communication', 2),
('What is one thing you wish we talked about more?', 'communication', 2),
('How can I better support you when you are stressed?', 'communication', 2),
('What does a perfect weekend look like for you?', 'communication', 1),

-- Intimacy (Level 2-3)
('What is your favorite memory of us together?', 'intimacy', 2),
('What first attracted you to me?', 'intimacy', 1),
('What is one thing about our relationship that makes you feel secure?', 'intimacy', 2),
('How do you feel most connected to me?', 'intimacy', 2),
('What is your favorite thing about our physical relationship?', 'intimacy', 3),
('When do you feel most appreciated by me?', 'intimacy', 2),
('What is a romantic gesture I have done that really touched you?', 'intimacy', 2),
('What makes you feel most desired?', 'intimacy', 3),

-- Future (Level 1-3)
('Where do you see us living in 5 years?', 'future', 2),
('What is one goal you want us to achieve together this year?', 'future', 1),
('What tradition do you want to start together?', 'future', 1),
('How many children do you want, and why?', 'future', 3),
('What is one place you want us to travel to together?', 'future', 1),
('What does your ideal retirement look like for us?', 'future', 3),
('What is one skill or hobby you would like us to learn together?', 'future', 1),
('How do you envision us celebrating our anniversaries?', 'future', 2),

-- Past (Level 1-2)
('What is your favorite childhood memory?', 'past', 1),
('What is one lesson from a past relationship that helps us now?', 'past', 3),
('What was your first impression of me?', 'past', 1),
('What is a challenge we overcame that made us stronger?', 'past', 2),
('What is your favorite date we have been on?', 'past', 1),
('What moment made you realize you loved me?', 'past', 2),
('What is something from your past that shaped who you are today?', 'past', 2),

-- Fun (Level 1)
('If we could have any superpower as a couple, what would it be?', 'fun', 1),
('What is the silliest thing we have done together?', 'fun', 1),
('If we won the lottery tomorrow, what is the first thing we would do?', 'fun', 1),
('What is your guilty pleasure TV show or movie?', 'fun', 1),
('If you could describe our relationship as a song, what would it be?', 'fun', 1),
('What is one food you could eat every day for the rest of your life?', 'fun', 1),
('What would our couple superhero name be?', 'fun', 1),
('If we could switch lives with any celebrity couple for a day, who would it be?', 'fun', 1),

-- Deep (Level 3-4)
('What is your biggest fear about our relationship?', 'deep', 4),
('What is one thing you have never told anyone else?', 'deep', 4),
('What do you think is the purpose of our relationship?', 'deep', 3),
('How has being with me changed you?', 'deep', 3),
('What is one insecurity you have that I can help you with?', 'deep', 4),
('What does unconditional love mean to you?', 'deep', 3),
('What is the most important value you want us to share?', 'deep', 3),

-- Gratitude (Level 1-2)
('What is one quality about me that you are grateful for?', 'gratitude', 1),
('What is something I do for you that you may take for granted?', 'gratitude', 2),
('What is one way our relationship has improved your life?', 'gratitude', 2),

-- Dreams (Level 2-3)
('What is a dream you have that you have not shared with me yet?', 'dreams', 3),
('If you could change one thing about your life right now, what would it be?', 'dreams', 2),
('What legacy do you want us to leave together?', 'dreams', 3);
