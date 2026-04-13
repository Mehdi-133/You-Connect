<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@youconnect.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'status'   => 'active',
            'class'    => 'dev room',
            'bio'      => 'Administrator account',
        ]);

        User::create([
            'name'     => 'Formateur',
            'email'    => 'formateur@youconnect.com',
            'password' => Hash::make('password'),
            'role'     => 'formateur',
            'status'   => 'active',
            'class'    => 'dev room',
            'bio'      => 'Formateur account',
        ]);

        User::create([
            'name'     => 'BDE Membre',
            'email'    => 'bde@youconnect.com',
            'password' => Hash::make('password'),
            'role'     => 'bde_membre',
            'status'   => 'active',
            'class'    => 'dev room',
            'bio'      => 'BDE Membre account',
        ]);


        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
