-- M1 / PLAN.md §6.8 (C20): money safety runs where the data is. Jobs run as postgres.
select cron.schedule('sweep', '* * * * *', 'select public.sweep()');
select cron.schedule('daily', '15 3 * * *', 'select public.daily()');
