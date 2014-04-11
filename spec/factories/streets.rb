# == Schema Information
#
# Table name: streets
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  name       :string(255)
#  data       :hstore
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_streets_on_user_id  (user_id)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :street do
  end
end
