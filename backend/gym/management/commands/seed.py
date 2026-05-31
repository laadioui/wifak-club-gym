from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from datetime import date, timedelta
from gym.models import Coach, Member, Session, Subscription, Salary, UserProfile, Product, CoachBonus, Notification


def parse_time(value):
    from datetime import datetime
    return datetime.strptime(value, '%H:%M').time()


class Command(BaseCommand):
    help = 'Seed the database with demo data for Wifak Club'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')
        User = get_user_model()
        admin_group, _ = Group.objects.get_or_create(name='admin')
        coach_group, _ = Group.objects.get_or_create(name='coach')
        reception_group, _ = Group.objects.get_or_create(name='reception')
        client_group, _ = Group.objects.get_or_create(name='client')

        coaches = [
            ('Rachid', 'Benali', 'rachid@wifakclub.ma', ['musculation'], 3500),
            ('Aziz', 'Mouhib', 'aziz@wifakclub.ma', ['musculation'], 3200),
            ('Zakaria', 'Idrissi', 'zakaria@wifakclub.ma', ['aerobic', 'biking'], 3000),
            ('Youssef', 'Amrani', 'youssef@wifakclub.ma', ['biking'], 2800),
            ('Abdelhamid', 'Tazi', 'abdelhamid@wifakclub.ma', ['steps', 'body_pump'], 2900),
            ('Fadwa', 'Chraibi', 'fadwa@wifakclub.ma', ['zumba', 'dance_oriental'], 3100),
        ]

        coach_objs = []
        for first, last, email, specialties, salary in coaches:
            obj, created = Coach.objects.update_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'phone': '+212600000000',
                    'phone_number': '+212600000000',
                    'specialties': specialties,
                    'base_salary': salary,
                    'approval_status': Coach.ApprovalStatus.APPROVED,
                    'is_active': True,
                }
            )
            coach_objs.append(obj)
            user, _ = User.objects.get_or_create(
                username=email,
                defaults={'email': email, 'first_name': first, 'last_name': last},
            )
            user.email = email
            user.first_name = first
            user.last_name = last
            user.set_password('coach123')
            user.save()
            user.groups.add(coach_group)
            UserProfile.objects.update_or_create(user=user, defaults={'role': 'coach', 'phone': obj.phone})

        members = [
            ('Ahmed', 'Lahlou', 'ahmed.lahlou@example.com', '+212600000001', True),
            ('Sara', 'Bennis', 'sara.bennis@example.com', '+212600000002', True),
            ('Karim', 'Ouali', 'karim.ouali@example.com', '+212600000003', True),
            ('Nour', 'Alami', 'nour.alami@example.com', '+212600000004', True),
            ('Omar', 'Fassi', 'omar.fassi@example.com', '+212600000005', True),
            ('Laila', 'Sekkat', 'laila.sekkat@example.com', '+212600000006', True),
            ('Mehdi', 'Berrada', 'mehdi.berrada@example.com', '+212600000007', True),
            ('Aya', 'Benkiran', 'aya.benkiran@example.com', '+212600000008', False),
        ]

        member_objs = []
        for first, last, email, phone, active in members:
            obj, created = Member.objects.update_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'phone': phone,
                    'is_active': active,
                }
            )
            member_objs.append(obj)
            user, _ = User.objects.get_or_create(
                username=email,
                defaults={'email': email, 'first_name': first, 'last_name': last},
            )
            user.email = email
            user.first_name = first
            user.last_name = last
            user.set_password('client123')
            user.save()
            user.groups.add(client_group)
            UserProfile.objects.update_or_create(user=user, defaults={'role': 'client', 'phone': obj.phone})

        sessions = [
            ('Biking Matinal', 'biking', 'Youssef', 'lundi', '07:00', '08:00', 15),
            ('Aerobic Power', 'aerobic', 'Zakaria', 'lundi', '09:00', '10:00', 20),
            ('Musculation AM', 'musculation', 'Rachid', 'lundi', '10:00', '12:00', 30),
            ('Zumba Latino', 'zumba', 'Fadwa', 'mardi', '18:00', '19:00', 25),
            ('Body Pump', 'body_pump', 'Abdelhamid', 'mercredi', '17:00', '18:00', 20),
            ('Steps Cardio', 'steps', 'Abdelhamid', 'jeudi', '08:00', '09:00', 18),
            ('Danse Orientale', 'dance_oriental', 'Fadwa', 'vendredi', '17:00', '18:00', 20),
            ('Musculation Soir', 'musculation', 'Aziz', 'mercredi', '20:00', '22:00', 30),
            ('Biking Weekend', 'biking', 'Youssef', 'samedi', '09:00', '10:00', 15),
        ]

        for title, type_, coach_name, day, start, end, capacity in sessions:
            coach = Coach.objects.filter(first_name=coach_name).first()
            Session.objects.update_or_create(
                title=title,
                defaults={
                    'type': type_,
                    'coach': coach,
                    'day_of_week': day,
                    'start_time': parse_time(start),
                    'end_time': parse_time(end),
                    'max_capacity': capacity,
                    'description': f'Session {title} animée par {coach_name}.',
                    'is_active': True,
                }
            )

        if member_objs and coach_objs:
            today = date.today()
            Subscription.objects.update_or_create(
                member=member_objs[0],
                defaults={
                    'type': 'pro',
                    'start_date': today - timedelta(days=30),
                    'end_date': today + timedelta(days=30),
                    'price': 450.00,
                    'is_paid': True,
                    'is_active': True,
                }
            )
            Salary.objects.update_or_create(
                coach=coach_objs[0],
                month=today.strftime('%Y-%m'),
                defaults={
                    'base_salary': coach_objs[0].base_salary,
                    'session_bonus': 250.00,
                    'is_paid': False,
                }
            )
            CoachBonus.objects.update_or_create(
                coach=coach_objs[0],
                label='Bonus retention clients',
                period=today.strftime('%Y-%m'),
                defaults={'amount': 250.00, 'is_paid': False},
            )

        admin_user, _ = User.objects.get_or_create(
            username='admin@wifakclub.ma',
            defaults={'email': 'admin@wifakclub.ma', 'first_name': 'Admin', 'last_name': 'Wifak'},
        )
        admin_user.email = 'admin@wifakclub.ma'
        admin_user.first_name = 'Admin'
        admin_user.last_name = 'Wifak'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.set_password('admin123')
        admin_user.save()
        admin_user.groups.add(admin_group)

        ladioui_admin, _ = User.objects.get_or_create(
            username='ladioui67@gmail.com',
            defaults={'email': 'ladioui67@gmail.com', 'first_name': 'Admin', 'last_name': 'Wifak'},
        )
        ladioui_admin.email = 'ladioui67@gmail.com'
        ladioui_admin.first_name = 'Admin'
        ladioui_admin.last_name = 'Wifak'
        ladioui_admin.is_staff = True
        ladioui_admin.is_superuser = True
        ladioui_admin.set_password('admin1234')
        ladioui_admin.save()
        ladioui_admin.groups.add(admin_group)
        UserProfile.objects.update_or_create(user=ladioui_admin, defaults={'role': 'admin', 'phone': '0766809049'})

        reception_user, _ = User.objects.get_or_create(
            username='shabman22@gmail.com',
            defaults={'email': 'shabman22@gmail.com', 'first_name': 'Responsable', 'last_name': 'Wifak'},
        )
        reception_user.email = 'shabman22@gmail.com'
        reception_user.first_name = 'Responsable'
        reception_user.last_name = 'Wifak'
        reception_user.set_password('respo123')
        reception_user.save()
        reception_user.groups.add(reception_group)
        UserProfile.objects.update_or_create(user=reception_user, defaults={'role': 'responsable'})

        products = [
            ('Gold Standard Whey', 'Optimum Nutrition', 'whey', 649, 24, 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80'),
            ('ISO100 Hydrolyzed', 'Dymatize', 'hydro', 780, 14, 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=900&q=80'),
            ('100% Creatine', 'BioTech USA', 'creatine', 260, 32, 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=900&q=80'),
            ('Pre Workout Black', 'Lazar Angelov', 'pre_workout', 390, 18, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80'),
            ('Fitness Gloves Pro', 'Tesla', 'accessories', 180, 40, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80'),
            # User-requested supplements
            ('ISO Whey', 'BioTech USA', 'whey', 1199, 20, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80'),
            ('Whey Zero', 'BioTech USA', 'whey', 1299, 18, 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=900&q=80'),
            ('Creatine Monohydrate 3000mg', 'BioTech USA', 'creatine', 349, 50, 'https://images.unsplash.com/photo-1599058917765-a780eda07a3f?auto=format&fit=crop&w=900&q=80'),
            ('Multivitamines', 'BioTech USA', 'multivitamine', 299, 60, 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80'),
            ('Pre Workout Extreme', 'BioTech USA', 'pre_workout', 399, 30, 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=900&q=80'),
            ('GH Hormones', 'BioTech USA', 'supplement', 899, 6, 'https://images.unsplash.com/photo-1526401485004-2fda9f4b1321?auto=format&fit=crop&w=900&q=80'),
            ('Tribooster', 'BioTech USA', 'supplement', 699, 12, 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80'),
            ('Muscle Mass', 'BioTech USA', 'mass', 449, 20, 'https://images.unsplash.com/photo-1526401485004-2fda9f4b1321?auto=format&fit=crop&w=900&q=80'),
            ('EAA Zero', 'BioTech USA', 'eaa', 299, 25, 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80'),
            ('Glutamine Zero', 'BioTech USA', 'glutamine', 299, 25, 'https://images.unsplash.com/photo-1616671276441-2f2f84de5a84?auto=format&fit=crop&w=900&q=80'),
            ('Zinc Magnesium', 'BioTech USA', 'multivitamine', 199, 36, 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80'),
            ('Arginine Xplode', 'BioTech USA', 'arginine', 249, 25, 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80'),
            ('Citrulline Pump', 'BioTech USA', 'citrulline', 279, 28, 'https://images.unsplash.com/photo-1526401485004-2fda9f4b1321?auto=format&fit=crop&w=900&q=80'),
            ('Pack Complement Premium', 'Wifak Club', 'pack', 1999, 15, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80'),
        ]
        for name, brand, category, price, stock, image_url in products:
            Product.objects.update_or_create(
                name=name,
                brand=brand,
                defaults={
                    'category': category,
                    'description': f'{name} par {brand}, selection premium Wifak Club.',
                    'price': price,
                    'stock': stock,
                    'image_url': image_url,
                    'is_featured': True,
                    'is_active': True,
                },
            )

        Notification.objects.get_or_create(
            user=reception_user,
            title='Dashboard live pret',
            defaults={'message': 'Les statistiques et scans QR sont disponibles.', 'type': 'success'},
        )

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
